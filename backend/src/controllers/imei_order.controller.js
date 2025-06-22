const IMEIOrder = require('../models/imei_order');
const Service = require('../models/service');
const User = require('../models/user');
const { sendMail } = require('../utils/mailer');

// Cargar fetch nativo o node-fetch según versión de Node
let fetch;
try {
  fetch = global.fetch || require('node-fetch');
} catch (e) {
  fetch = global.fetch;
}

// Crear una orden (usuario o guest), acepta varios IMEI en una sola orden
exports.createOrder = async (req, res) => {
  try {
    let { imei, imeis, service_id, guest_email } = req.body;
    const user = req.user || null;
    const user_id = user ? user.user_id : 999;

    if (!user_id && !guest_email) {
      return res.status(400).json({ error: 'Se requiere guest_email para pedidos como invitado.' });
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
      if (!/^\d{15}$/.test(i)) {
        return res.status(400).json({ error: `IMEI inválido: ${i}` });
      }
    }

    let price_used = service.price_guest;
    let user_type_at_order = 'guest';
    if (user) {
      const tipo = user.user_type || 'registered';
      user_type_at_order = tipo;
      if (tipo === 'pro') price_used = service.price_pro;
      else if (tipo === 'premium') price_used = service.price_premium;
      else price_used = service.price_registered;
    }

    const imeiFieldToSave = JSON.stringify(imeisArr);

    const newOrder = await IMEIOrder.create({
      imei: imeiFieldToSave,
      service_id,
      user_id,
      guest_email: user_id === 999 ? guest_email : null,
      status: 'pending',
      created_at: new Date(),
      price_used,
      user_type_at_order,
      service_name_at_order: service.service_name,
      currency: 'USD',
      ip_address: req.ip
    });

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
        const apiRes = await fetch(process.env.IMEI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const apiData = await apiRes.json();
        apiResults.push({
          imei: oneImei,
          api: apiData,
          status: apiData.success === true || apiData.status === 'success' ? 'completed' : 'failed'
        });
        clientApiResults.push({
          imei: oneImei,
          api: { result: apiData.result },
          status: apiData.success === true || apiData.status === 'success' ? 'completed' : 'failed'
        });
      }
      newOrder.result = JSON.stringify(apiResults);
      const allOk = apiResults.every(r => r.status === 'completed');
      const anyOk = apiResults.some(r => r.status === 'completed');
      newOrder.status = allOk ? 'completed' : anyOk ? 'partial' : 'failed';
      await newOrder.save();
      clientResults = clientApiResults;
    } catch (fetchErr) {
      newOrder.result = JSON.stringify({ error: 'No se pudo contactar la API externa', detail: fetchErr.message });
      newOrder.status = 'failed';
      await newOrder.save();
      clientResults = [{ error: 'No se pudo contactar la API externa' }];
    }

    // Notificación por mail si corresponde
if (['completed', 'partial'].includes(newOrder.status)) {
  let emailTo = newOrder.guest_email;
  if (!emailTo && newOrder.user_id) {
    const user = await User.findByPk(newOrder.user_id);
    emailTo = user ? user.email : null;
  }
  if (emailTo) {
    // Suponiendo que imeisArr es un array de objetos con campos similares al JSON que pegaste antes
    const imeiObj = imeisArr[0] || {};
    const imei = imeiObj.imei || newOrder.imei || '';
    const modelo = imeiObj.api?.object?.model || 'Desconocido';
    const fmiStatus = imeiObj.api?.object?.fmiOn === false ? 'OFF' : 'ON';
    const status = newOrder.status || 'Desconocido';
    const resultado = imeiObj.api?.result || imeiObj.result || newOrder.result || 'Sin resultado';

    const subject = `Resultado de tu orden IMEI [${imei}]`;

    const html = `
      <h2>¡Aquí está el resultado de tu consulta IMEI!</h2>
      <ul>
        <li><strong>Modelo:</strong> ${modelo}</li>
        <li><strong>IMEI:</strong> ${imei}</li>
        <li><strong>Find My iPhone:</strong> ${fmiStatus}</li>
        <li><strong>Estado de la orden:</strong> ${status}</li>
      </ul>
      <pre style="background:#f6f6f6;padding:1em;border-radius:5px;">${resultado}</pre>
      <p>Gracias por usar nuestro servicio.</p>
    `;

    await sendMail({
      to: emailTo,
      subject,
      html,
      type: null // No uses 'order_result' así forzamos tu subject y html
    });
  }
}

    res.status(201).json(clientResults);
  } catch (error) {
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

    const validStatuses = ['pending', 'completed', 'failed'];
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
        await sendMail({
          to: emailTo,
          type: 'order_result',
          data: {
            result: order.result,
            imeis: (() => {
              try { return JSON.parse(order.imei); } catch { return [order.imei]; }
            })(),
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

// Historial de órdenes del usuario autenticado
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const orders = await IMEIOrder.findAll({
      where: { user_id: userId },
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
        'imei' // asegúrate que este campo existe
      ],
      include: [
        {
          model: User,
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
        imei: order.imei
      };
    });

    res.json(rows);
  } catch (error) {
    console.error('Error in adminList:', error);
    res.status(500).json({ error: 'Error al obtener la orden', detail: error.message, stack: error.stack });
  }
};