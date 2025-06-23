const Payment = require('../models/payment');
const User = require('../models/user');
const ImeiOrder = require('../models/imei_order');
const Service = require('../models/service');
const { sendMail } = require('../utils/mailer');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

let fetch;
try {
  fetch = global.fetch || require('node-fetch');
} catch (e) {
  fetch = global.fetch;
}

// Cache temporal para resultado HTML de la API por session_id
const imeiResultHtmlCache = {};

function cleanImeiResult(html) {
  if (!html) return '';
  let text = html.replace(/<br\s*\/?>/gi, ' ');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/\s\s+/g, ' ').trim();
  return text;
}

function getFrontendUrl() {
  if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL no está definido en variables de entorno');
  }
  return process.env.FRONTEND_URL.replace(/\/$/, ''); // quita / final si lo hay
}

exports.createStripeCheckoutSession = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { amount, original_amount, currency = 'usd' } = req.body;

    if (!amount || isNaN(amount) || amount <= 0)
      return res.status(400).json({ error: 'Monto inválido' });

    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const frontendUrl = getFrontendUrl();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: 'Recarga de saldo' },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: String(user_id),
        recharge_amount: String(amount),
        original_amount: original_amount ? String(original_amount) : String(amount),
      },
      success_url: `${frontendUrl}/add-funds.html?funds=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/add-funds.html?funds=cancel`,
    });

    res.json({ checkout_url: session.url });
  } catch (error) {
    console.error('Error creando checkout session:', error);
    res.status(500).json({ error: 'No se pudo crear la sesión de pago' });
  }
};

exports.createImeiStripeCheckoutSession = async (req, res) => {
  try {
    const { imei, service_id, guest_email } = req.body;

    if (!imei || !/^\d{15}$/.test(imei)) {
      return res.status(400).json({ error: 'IMEI inválido' });
    }
    if (!service_id) {
      return res.status(400).json({ error: 'Service_id requerido' });
    }

    const service = await Service.findByPk(service_id);
    if (!service || !service.active) {
      return res.status(400).json({ error: 'Servicio no válido' });
    }

    let user_id, user_type, username, email;
    if (req.user) {
      user_id = req.user.user_id;
      user_type = req.user.user_type;
      username = req.user.username;
      email = req.user.email;
    } else {
      user_id = 999;
      user_type = 'guest';
      username = 'guest';
      email = guest_email || null;
    }

    let price = user_type === 'guest'
      ? service.price_guest
      : service.price_registered;
    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Precio de servicio inválido' });
    }

    const frontendUrl = getFrontendUrl();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `IMEI Check: ${imei}`,
              description: service.service_name,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        imei,
        service_id: String(service_id),
        user_id: String(user_id),
        user_type: String(user_type),
        username: String(username),
        email: email || '',
      },
      success_url: `${frontendUrl}/imei-check-guest.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/imei-check-guest.html?payment=cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creando checkout session IMEI:', error);
    res.status(500).json({ error: 'No se pudo crear la sesión de pago IMEI' });
  }
};

exports.stripeWebhook = async (req, res) => {
  console.log('===> Stripe webhook recibido:', req.headers, req.body);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Procesa checkout.session.completed (flujo principal actual)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};

    if (metadata.imei && metadata.service_id) {
      const imei = metadata.imei;
      const service_id = metadata.service_id;
      const user_id = metadata.user_id ? Number(metadata.user_id) : 999;
      const user_type = metadata.user_type || 'guest';
      const username = metadata.username || 'guest';
      const guest_email = metadata.email || null;

      try {
        const existingPayment = await Payment.findOne({ where: { stripe_checkout_session_id: session.id } });
        if (existingPayment) {
          return res.status(200).end();
        }

        const service = await Service.findByPk(service_id);
        if (!service) {
          return res.status(200).end();
        }
        const price = user_type === 'guest' ? service.price_guest : service.price_registered;

        const imeiOrder = await ImeiOrder.create({
          user_id,
          imei,
          service_id,
          status: 'pending',
          result: null,
          guest_email,
          price_used: price,
          user_type_at_order: user_type,
          service_name_at_order: service.service_name,
          currency: 'usd',
          ip_address: session.client_reference_id || null,
          payment_intent_id: session.payment_intent,
        });

        await Payment.create({
          order_id: imeiOrder.order_id,
          user_id,
          amount: price,
          currency: 'usd',
          status: 'approved',
          payment_method: 'stripe',
          payment_reference: 'stripe_checkout_imei',
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent,
          error_message: null,
        });

        try {
          const payload = {
            key: process.env.IMEI_API_KEY,
            imei: imei,
            service: service_id,
          };
          const apiRes = await fetch(process.env.IMEI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const apiData = await apiRes.json();

          const resultClean = typeof apiData.result === 'string'
            ? cleanImeiResult(apiData.result)
            : JSON.stringify(apiData.result);

          imeiOrder.result = resultClean;
          imeiOrder.status = (apiData.success === true || apiData.status === 'success') ? 'completed' : 'failed';
          await imeiOrder.save();

          // Guarda HTML para el frontend solo (cache temporal)
          if (session.id && apiData.result) {
            imeiResultHtmlCache[session.id] = {
              html: apiData.result,
              timestamp: Date.now()
            };
            setTimeout(() => { delete imeiResultHtmlCache[session.id]; }, 5 * 60 * 1000);
          }

          // Email: enviar el mismo HTML que frontend (con formato)
          if (guest_email && imeiOrder.status === 'completed' && apiData.result) {
            await sendMail({
              to: guest_email,
              type: 'imei_paid_guest',
              data: {
                imei,
                service: service.service_name,
                price,
                currency: 'usd',
                result: apiData.result
              }
            });
          }

        } catch (apiErr) {
          imeiOrder.status = 'failed';
          imeiOrder.result = JSON.stringify({ error: 'No se pudo contactar la API externa', detail: apiErr.message });
          await imeiOrder.save();
        }

      } catch (err) {
        console.error('Error procesando pago IMEI Stripe en webhook:', err);
      }
    } else if (metadata.user_id) {
      const user_id = metadata.user_id;
      const amount = metadata.recharge_amount
        ? Number(metadata.recharge_amount)
        : (Number(session.amount_total) / 100);
      const creditedAmount = metadata.original_amount
        ? Number(metadata.original_amount)
        : amount;
      const currency = session.currency || 'usd';

      try {
        const user = await User.findByPk(user_id);
        if (!user) {
          return res.status(200).end();
        }

        const existing = await Payment.findOne({ where: { stripe_checkout_session_id: session.id } });
        if (existing) {
          return res.status(200).end();
        }

        const balance_before = Number(user.balance) || 0;
        user.balance = balance_before + creditedAmount;
        await user.save();

        await Payment.create({
          user_id,
          amount,
          credited_amount: creditedAmount,
          currency,
          payment_method: 'stripe',
          status: 'approved',
          payment_reference: 'stripe_checkout',
          stripe_checkout_session_id: session.id,
          balance_before,
          balance_after: user.balance,
        });

        await sendMail({
          to: user.email,
          type: 'balance_recharge',
          data: { amount: creditedAmount, currency, balance: user.balance }
        });
      } catch (err) {
        console.error('Error procesando pago Stripe en webhook:', err);
      }
    }
    return res.status(200).end();
  }

  // Procesa payment_intent.succeeded (soporte directo para PaymentIntent)
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const metadata = intent.metadata || {};
    const payment_intent_id = intent.id;

    // Evita duplicados si ya existe un Payment con este intent
    const existing = await Payment.findOne({ where: { stripe_payment_intent_id: payment_intent_id } });
    if (existing) {
      return res.status(200).end();
    }

    // Si viene de un IMEI order
    if (metadata.imei && metadata.service_id) {
      const imei = metadata.imei;
      const service_id = metadata.service_id;
      const user_id = metadata.user_id ? Number(metadata.user_id) : 999;
      const user_type = metadata.user_type || 'guest';
      const username = metadata.username || 'guest';
      const guest_email = metadata.email || null;

      try {
        const service = await Service.findByPk(service_id);
        if (!service) {
          return res.status(200).end();
        }
        const price = user_type === 'guest' ? service.price_guest : service.price_registered;

        const imeiOrder = await ImeiOrder.create({
          user_id,
          imei,
          service_id,
          status: 'pending',
          result: null,
          guest_email,
          price_used: price,
          user_type_at_order: user_type,
          service_name_at_order: service.service_name,
          currency: intent.currency || 'usd',
          ip_address: intent.client_reference_id || null,
          payment_intent_id: payment_intent_id,
        });

        await Payment.create({
          order_id: imeiOrder.order_id,
          user_id,
          amount: price,
          currency: intent.currency || 'usd',
          status: 'approved',
          payment_method: 'stripe',
          payment_reference: 'stripe_payment_intent_imei',
          stripe_payment_intent_id: payment_intent_id,
          error_message: null,
        });

        try {
          const payload = {
            key: process.env.IMEI_API_KEY,
            imei: imei,
            service: service_id,
          };
          const apiRes = await fetch(process.env.IMEI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const apiData = await apiRes.json();

          const resultClean = typeof apiData.result === 'string'
            ? cleanImeiResult(apiData.result)
            : JSON.stringify(apiData.result);

          imeiOrder.result = resultClean;
          imeiOrder.status = (apiData.success === true || apiData.status === 'success') ? 'completed' : 'failed';
          await imeiOrder.save();

          // No hay session_id, así que no hay cache de html temporal aquí

          if (guest_email && imeiOrder.status === 'completed' && apiData.result) {
            await sendMail({
              to: guest_email,
              type: 'imei_paid_guest',
              data: {
                imei,
                service: service.service_name,
                price,
                currency: intent.currency || 'usd',
                result: apiData.result
              }
            });
          }

        } catch (apiErr) {
          imeiOrder.status = 'failed';
          imeiOrder.result = JSON.stringify({ error: 'No se pudo contactar la API externa', detail: apiErr.message });
          await imeiOrder.save();
        }

      } catch (err) {
        console.error('Error procesando payment_intent.succeeded IMEI:', err);
      }
      return res.status(200).end();
    }

    // Si es recarga de saldo
    if (metadata.user_id) {
      const user_id = metadata.user_id;
      const amount = metadata.recharge_amount
        ? Number(metadata.recharge_amount)
        : (Number(intent.amount_received) / 100);
      const creditedAmount = metadata.original_amount
        ? Number(metadata.original_amount)
        : amount;
      const currency = intent.currency || 'usd';

      try {
        const user = await User.findByPk(user_id);
        if (!user) {
          return res.status(200).end();
        }

        const balance_before = Number(user.balance) || 0;
        user.balance = balance_before + creditedAmount;
        await user.save();

        await Payment.create({
          user_id,
          amount,
          credited_amount: creditedAmount,
          currency,
          payment_method: 'stripe',
          status: 'approved',
          payment_reference: 'stripe_payment_intent',
          stripe_payment_intent_id: payment_intent_id,
          balance_before,
          balance_after: user.balance,
        });

        await sendMail({
          to: user.email,
          type: 'balance_recharge',
          data: { amount: creditedAmount, currency, balance: user.balance }
        });
      } catch (err) {
        console.error('Error procesando payment_intent.succeeded recarga:', err);
      }
      return res.status(200).end();
    }

    // Otros casos: simplemente marca el payment como recibido, aunque no puedas asociarlo a usuario/orden
    try {
      await Payment.create({
        amount: Number(intent.amount_received) / 100,
        currency: intent.currency || 'usd',
        status: 'approved',
        payment_method: 'stripe',
        payment_reference: 'stripe_payment_intent',
        stripe_payment_intent_id: payment_intent_id,
        error_message: null,
      });
    } catch (err) {
      console.error('Error procesando payment_intent.succeeded genérico:', err);
    }
    return res.status(200).end();
  }

  // Otros eventos: solo responde 200 OK.
  res.status(200).end();
};

exports.getPaymentBySession = async (req, res) => {
  const { session_id } = req.params;
  try {
    const payment = await Payment.findOne({
      where: { stripe_checkout_session_id: session_id }
    });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({
      amount: payment.amount,
      credited_amount: payment.credited_amount,
      currency: payment.currency,
      status: payment.status
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching payment' });
  }
};

exports.createManualPayment = async (req, res) => {
  try {
    // Versión para pagos manuales donde envías email en vez de user_id
    const { email, amount, reference, currency = 'USD' } = req.body;
    if (!email || !amount || isNaN(amount) || amount <= 0 || !reference)
      return res.status(400).json({ error: 'Datos incompletos o monto inválido' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const balance_before = Number(user.balance) || 0;
    user.balance = balance_before + Number(amount);
    await user.save();

    const newPayment = await Payment.create({
      user_id: user.user_id,
      amount: Number(amount),
      credited_amount: Number(amount),
      currency,
      payment_method: 'manual',
      status: 'approved',
      payment_reference: reference,
      balance_before,
      balance_after: user.balance
    });

    await sendMail({
      to: user.email,
      type: 'balance_recharge',
      data: {
        amount: Number(amount),
        currency,
        balance: user.balance
      }
    });

    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Error en createManualPayment:', error);
    res.status(500).json({ error: 'Error al registrar el pago manual' });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const payments = await Payment.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
    res.json(payments);
  } catch (error) {
    console.error('Error en getMyPayments:', error);
    res.status(500).json({ error: 'Error al obtener tus pagos' });
  }
};

exports.getAllPayments = async (_req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{ model: User, attributes: ['username', 'email'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(payments);
  } catch (error) {
    console.error('Error en getAllPayments:', error);
    res.status(500).json({ error: 'Error al obtener todos los pagos' });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['username', 'email'] }]
    });
    if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(payment);
  } catch (error) {
    console.error('Error en getPaymentById:', error);
    res.status(500).json({ error: 'Error al obtener el pago' });
  }
};

exports.getPaymentsByUser = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { user_id: req.params.user_id },
      order: [['created_at', 'DESC']]
    });
    res.json(payments);
  } catch (error) {
    console.error('Error en getPaymentsByUser:', error);
    res.status(500).json({ error: 'Error al obtener los pagos del usuario' });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });
    await payment.update(req.body);
    res.json(payment);
  } catch (error) {
    console.error('Error en updatePayment:', error);
    res.status(500).json({ error: 'Error al actualizar el pago' });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });
    await payment.destroy();
    res.json({ message: 'Pago eliminado correctamente' });
  } catch (error) {
    console.error('Error en deletePayment:', error);
    res.status(500).json({ error: 'Error al eliminar el pago' });
  }
};

// Para polling de resultado IMEI con session_id (usado en /api/payments/order-by-session/:session_id)
exports.getOrderBySession = async (req, res) => {
  try {
    const { session_id } = req.params;
    const payment = await Payment.findOne({ where: { stripe_checkout_session_id: session_id } });
    if (!payment || !payment.order_id) {
      return res.status(404).json({ error: 'Order not found for this session' });
    }
    const order = await ImeiOrder.findByPk(payment.order_id);
    if (!order) {
      return res.status(404).json({ error: 'IMEI order not found' });
    }
    // Si existe en cache el HTML, devuélvelo (y bórralo)
    if (imeiResultHtmlCache[session_id]) {
      const html = imeiResultHtmlCache[session_id].html;
      delete imeiResultHtmlCache[session_id];
      return res.json({
        status: order.status,
        result: html,
        imei: order.imei,
        service: order.service_name_at_order,
        created_at: order.created_at,
        html_available: true
      });
    } else {
      return res.json({
        status: order.status,
        result: order.result,
        imei: order.imei,
        service: order.service_name_at_order,
        created_at: order.created_at,
        html_available: false
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error fetching IMEI order by session' });
  }
};