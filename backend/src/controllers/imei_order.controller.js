const IMEIOrder = require('../models/imei_order');
const Service = require('../models/service');
const User = require('../models/user');
const sequelize = require('../../config/db');
const { Op } = require('sequelize');
const { sendMail } = require('../utils/mailer');
const getUserBalance = require('../utils/getUserBalance');

// Cargar fetch nativo o node-fetch según versión de Node
let fetch;
try {
  fetch = global.fetch || require('node-fetch');
} catch (e) {
  fetch = global.fetch;
}

// Crear una orden (usuario o guest), acepta varios IMEI en una sola orden
exports.createOrder = async (req, res) => {
  let transaction = null;
  try {
    let { imei, imeis, service_id, guest_email } = req.body;
    const user = req.user || null;
    const user_id = user ? user.user_id : null;

    if (!user_id) {
      return res.status(403).json({
        error: 'Los pedidos guest deben pagarse por Stripe antes de crearse.',
        checkout_endpoint: '/api/payments/stripe/imei-checkout'
      });
    }

    const service = await Service.findByPk(service_id);
    if (!service || !service.active) {
      return res.status(404).json({ error: 'Servicio no encontrado o inactivo' });
    }

    let imeisArr = [];
    if (Array.isArray(imeis)) imeisArr = imeis;
    else if (imei) imeisArr = [imei];

    imeisArr = imeisArr.map(i => ('' + i).trim()).filter(i => i.length > 0);

    if (imeisArr.length === 0 || imeisArr.length > 50) {
      return res.status(400).json({ error: 'Debes enviar entre 1 y 50 IMEIs' });
    }

    for (const i of imeisArr) {
      // Accept 15-digit IMEI or alphanumeric SN (8-25 chars)
      if (!/^\d{15}$/.test(i) && !/^[A-Za-z0-9]{8,25}$/.test(i)) {
        return res.status(400).json({ error: `IMEI/SN inválido: ${i}` });
      }
    }

    let unit_price = service.price_registered;
    let user_type_at_order = user.user_type || 'registered';
    if (user_type_at_order === 'pro') unit_price = service.price_pro;
    else if (user_type_at_order === 'premium') unit_price = service.price_premium;

    unit_price = Number(unit_price);
    if (Number.isNaN(unit_price) || unit_price <= 0) {
      return res.status(400).json({ error: 'Precio de servicio inválido para el tipo de usuario' });
    }

    transaction = await sequelize.transaction();

    await User.findByPk(user_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const estimated_total = unit_price * imeisArr.length;
    const currentBalance = await getUserBalance(user_id, { transaction });
    if (currentBalance < estimated_total) {
      await transaction.rollback();
      transaction = null;
      return res.status(402).json({
        error: 'Saldo insuficiente',
        available_balance: currentBalance,
        required_balance: estimated_total,
        imeis_count: imeisArr.length,
        unit_price
      });
    }

    const imeiFieldToSave = JSON.stringify(imeisArr);

    const newOrder = await IMEIOrder.create({
      imei: imeiFieldToSave,
      service_id,
      user_id,
      guest_email: null,
      status: 'pending',
      created_at: new Date(),
      price_used: estimated_total,
      user_type_at_order,
      service_name_at_order: service.service_name,
      currency: 'USD',
      ip_address: req.ip,
      request_source: 'imeicheck2'
    }, { transaction });

    let clientResults = null;

    try {
      // Llama la API externa para cada IMEI y guarda los resultados juntos
      const apiResults = [];
      const clientApiResults = [];
      for (const oneImei of imeisArr) {
        const payload = {
          key: process.env.IMEI_API_KEY,
          imei: oneImei,
          service: service_id
        };
        try {
          const apiRes = await fetch(process.env.IMEI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const rawBody = await apiRes.text();
          let apiData;
          try {
            apiData = rawBody ? JSON.parse(rawBody) : {};
          } catch (_parseErr) {
            apiData = { raw: rawBody };
          }
          const succeeded = apiRes.ok && (apiData.success === true || apiData.status === 'success');
          const normalizedApi = {
            result: apiData.result ?? null,
            object: apiData.object ?? null,
            message: apiData.message || apiData.error || (!apiRes.ok ? `HTTP ${apiRes.status}` : null),
            status: apiData.status || (succeeded ? 'success' : 'failed')
          };
          apiResults.push({
            imei: oneImei,
            api: apiData,
            status: succeeded ? 'completed' : 'failed'
          });
          clientApiResults.push({
            imei: oneImei,
            api: normalizedApi,
            status: succeeded ? 'completed' : 'failed'
          });
        } catch (fetchErr) {
          console.error('Error al contactar API externa:', fetchErr);
          clientApiResults.push({
            imei: oneImei,
            api: {
              result: null,
              object: null,
              message: fetchErr.message || fetchErr.toString(),
              status: 'failed'
            },
            status: 'failed',
            error: 'No se pudo contactar la API externa: ' + (fetchErr.message || fetchErr.toString())
          });
        }
      }
      newOrder.result = JSON.stringify(apiResults);
      const allOk = apiResults.every(r => r.status === 'completed');
      const anyOk = apiResults.some(r => r.status === 'completed');
      const completedCount = apiResults.filter(r => r.status === 'completed').length;
      const chargedAmount = completedCount * unit_price;
      newOrder.status = allOk ? 'completed' : anyOk ? 'partial' : 'failed';
      newOrder.price_used = chargedAmount;
      await newOrder.save({ transaction });
      clientResults = clientApiResults;
    } catch (fetchErr) {
      newOrder.result = JSON.stringify({ error: 'No se pudo contactar la API externa', detail: fetchErr.message });
      newOrder.status = 'failed';
      newOrder.price_used = 0;
      await newOrder.save({ transaction });
      clientResults = imeisArr.map(i => ({
        imei: i,
        api: {
          result: null,
          object: null,
          message: fetchErr.message || fetchErr.toString(),
          status: 'failed'
        },
        status: 'failed',
        error: 'No se pudo contactar la API externa: ' + (fetchErr.message || fetchErr.toString())
      }));
    }

    await transaction.commit();
    transaction = null;

    // Notificación por mail si corresponde
    if (['completed', 'partial'].includes(newOrder.status)) {
      let emailTo = newOrder.guest_email;
      if (!emailTo && newOrder.user_id) {
        const user = await User.findByPk(newOrder.user_id);
        emailTo = user ? user.email : null;
      }
      if (emailTo) {
        // Tomar el primer resultado relevante para el correo
        let resultArr = [];
        try { resultArr = JSON.parse(newOrder.result); } catch (e) {}
        const firstResult = Array.isArray(resultArr) && resultArr[0] ? resultArr[0] : {};
        try {
          await sendMail({
            to: emailTo,
            type: 'order_result',
            data: {
              result: firstResult.api?.result || firstResult.result || '',
              imei: firstResult.imei || (Array.isArray(imeisArr) ? imeisArr[0] : newOrder.imei),
              service: newOrder.service_name_at_order
            }
          });
        } catch (mailErr) {
          console.error('Error enviando email de resultado:', mailErr);
        }
      }
    }

    res.status(201).json(clientResults);
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackErr) {
        console.error('Error en rollback createOrder:', rollbackErr);
      }
    }
    console.error(error);
    res.status(500).json({ error: 'Error al crear la orden' });
  }
};

// Cambiar el status de una orden (admin/sistema o worker)
exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.id;
  const { status, result } = req.body;

  try {
    const order = await IMEIOrder.findByPk(orderId);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    const validStatuses = ['pending', 'completed', 'partial', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    if (typeof result !== 'undefined') {
      order.result = typeof result === 'string' ? result : JSON.stringify(result);
    }

    order.status = status;
    await order.save();

    if (status === 'completed') {
      let emailTo = order.guest_email;
      if (!emailTo && order.user_id) {
        const user = await User.findByPk(order.user_id);
        emailTo = user ? user.email : null;
      }
      const service = await Service.findByPk(order.service_id);
      if (emailTo) {
        // Tomar el primer IMEI de la orden para el email
        let imeiArr = [];
        try { imeiArr = JSON.parse(order.imei); } catch (e) {}
        const imei = Array.isArray(imeiArr) && imeiArr[0] ? imeiArr[0] : order.imei;
        await sendMail({
          to: emailTo,
          type: 'order_result',
          data: {
            result: order.result,
            imei,
            service: service ? service.service_name : order.service_name_at_order
          }
        });
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Error en updateOrderStatus:', error);
    res.status(500).json({ error: 'Error al actualizar la orden' });
  }
};

// Historial de órdenes del usuario autenticado (con filtros opcionales)
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { imei, status, service, from, to } = req.query;
    const where = { user_id: userId };
    if (status) where.status = status;
    if (service) where.service_name_at_order = { [Op.iLike]: `%${service}%` };
    if (imei) where.imei = { [Op.iLike]: `%${imei}%` };
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at[Op.gte] = new Date(from);
      if (to) where.created_at[Op.lte] = new Date(to + 'T23:59:59');
    }
    const orders = await IMEIOrder.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving your orders' });
  }
};

// Todas las órdenes (admin/superadmin)
exports.getAllOrders = async (_req, res) => {
  try {
    const orders = await IMEIOrder.findAll({
      include: [
        { model: User, attributes: ['username', 'email'] },
        { model: Service, attributes: ['service_name'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todas las órdenes' });
  }
};

// Obtener orden por ID (admin/superadmin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await IMEIOrder.findByPk(req.params.id, {
      include: [
        { model: Service, attributes: ['service_name'] },
        { model: User, attributes: ['username', 'email'] }
      ]
    });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la orden' });
  }
};

// Buscar orden por session_id de Stripe (para polling frontend loader)
exports.getOrderBySession = async (req, res) => {
  try {
    const { session_id } = req.params;
    const Payment = require('../models/payment');
    const payment = await Payment.findOne({ where: { stripe_checkout_session_id: session_id } });
    if (!payment || !payment.order_id) {
      return res.status(404).json({ error: 'Order not found for this session' });
    }
    const order = await IMEIOrder.findByPk(payment.order_id);
    if (!order) {
      return res.status(404).json({ error: 'IMEI order not found' });
    }
    let serviceName = order.service_name_at_order;
    if (!serviceName && order.service_id) {
      const service = await Service.findByPk(order.service_id);
      if (service) serviceName = service.service_name;
    }
    res.json({
      status: order.status,
      result: order.result,
      imei: order.imei,
      service: serviceName,
      created_at: order.created_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching IMEI order by session' });
  }
};

// ADMIN: Lista de órdenes para dashboard admin-orders.html
exports.adminList = async (req, res) => {
  try {
    const orders = await IMEIOrder.findAll({
      attributes: [
        'order_id',
        'status',
        'user_id',
        'service_id',
        'price_used',
        'created_at',
        'user_type_at_order',
        'guest_email',
        'service_name_at_order',
        'imei',
        'request_source'
      ],
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['email'],
          required: false
        }
      ],
      order: [['order_id', 'DESC']]
    });

    const rows = orders.map(order => {
      let user_email = '';
      if (order.user_type_at_order === 'guest') {
        user_email = order.guest_email || '';
      } else if (order.User && order.User.email) {
        user_email = order.User.email;
      }
      return {
        order_id: order.order_id,
        status: order.status,
        user_email,
        user_type_at_order: order.user_type_at_order,
        guest_email: order.guest_email,
        service_id: order.service_id,
        service_name_at_order: order.service_name_at_order,
        price_used: order.price_used,
        created_at: order.created_at,
        imei: order.imei,
        request_source: order.request_source || 'imeicheck2'
      };
    });

    res.json(rows);
  } catch (error) {
    console.error('Error in adminList:', error);
    res.status(500).json({ error: 'Error al obtener la orden', detail: error.message, stack: error.stack });
  }
};