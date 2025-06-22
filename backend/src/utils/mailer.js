const mailgun = require('mailgun-js');

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const FROM = process.env.MAILGUN_FROM || `IMEICheck <noreply@${process.env.MAILGUN_DOMAIN}>`;

const templates = {
  verification: ({ code }) => ({
    subject: 'Verifica tu correo',
    html: `<p>Tu código de verificación es: <b>${code}</b></p><p>Ingresa este código en la plataforma para verificar tu cuenta.</p>`,
    text: `Tu código de verificación es: ${code}`,
  }),
  password_reset: ({ code }) => ({
    subject: 'Código de recuperación de contraseña',
    html: `<p>Tu código de recuperación es: <b>${code}</b></p><p>Este código es válido por 15 minutos.</p>`,
    text: `Tu código de recuperación es: ${code}`,
  }),
  order_result: ({ result, imei, service }) => {
    let prettyResult = '';
    try {
      let parsed = typeof result === 'string' ? JSON.parse(result) : result;
      if (parsed && parsed.result) {
        prettyResult = parsed.result.trim();
      } else if (typeof parsed === 'string') {
        prettyResult = parsed;
      } else {
        prettyResult = JSON.stringify(parsed, null, 2);
      }
    } catch (e) {
      prettyResult = result;
    }

    return {
      subject: `Resultado de tu orden IMEI [${order.imei}]`,
      html: `
        <div style="font-family:sans-serif;">
          <h2>¡Tu orden fue procesada exitosamente!</h2>
          <p><b>Servicio:</b> ${service}</p>
          <p><b>IMEI:</b> ${imei}</p>
          <p><b>Resultado:</b></p>
          <pre style="background:#f1f1f1;padding: 10px; border-radius:5px;">${prettyResult}</pre>
          <p>Gracias por usar imeicheck2.com</p>
        </div>
      `,
      text: `¡Tu orden fue procesada exitosamente!\n\nServicio: ${service}\nIMEI: ${imei}\n\nResultado:\n${prettyResult}\n\nGracias por usar imeicheck2.com`
    };
  },
  balance_recharge: ({ amount, currency, balance }) => ({
    subject: '¡Saldo recargado exitosamente!',
    html: `<p>Tu saldo fue recargado con éxito.</p>
           <p><b>Monto:</b> ${amount} ${currency}</p>
           <p><b>Saldo actual:</b> ${balance} ${currency}</p>`,
    text: `Monto: ${amount} ${currency}\nSaldo actual: ${balance} ${currency}`,
  }),
  imei_paid_guest: ({ imei, service, price, currency, result }) => {
    let resultSection = '';
    if (result) {
      // Muestra el resultado tal como lo entrega la API (con HTML)
      resultSection = `<p><b>Resultado:</b></p>
        <div style="background:#f1f1f1;padding:10px;border-radius:5px;">${result}</div>`;
    } else {
      resultSection = `<p>Te notificaremos en este correo cuando el resultado esté disponible.</p>`;
    }
    return {
      subject: `Tu orden IMEI (${imei}) fue recibida`,
      html: `
        <div style="font-family:sans-serif;">
          <h2>¡Gracias por tu compra!</h2>
          <p>Hemos recibido tu pedido de chequeo IMEI.</p>
          <p><b>Servicio:</b> ${service}</p>
          <p><b>IMEI:</b> ${imei}</p>
          <p><b>Monto:</b> ${price} ${currency}</p>
          ${resultSection}
          <p>Gracias por usar imeicheck2.com</p>
        </div>
      `,
      text:
        `¡Gracias por tu compra!\n\nHemos recibido tu pedido de chequeo IMEI.\nServicio: ${service}\nIMEI: ${imei}\nMonto: ${price} ${currency}\n` +
        (result ? `Resultado:\n${result}\n` : 'Te notificaremos en este correo cuando el resultado esté disponible.\n') +
        `Gracias por usar imeicheck2.com`
    };
  }
};

async function sendMail({ to, type, data }) {
  const tpl = templates[type];
  if (!tpl) throw new Error('Tipo de email desconocido');
  const { subject, html, text } = tpl(data);

  const mailData = {
    from: FROM,
    to,
    subject,
    text,
    html,
  };

  return new Promise((resolve, reject) => {
    mg.messages().send(mailData, function (error, body) {
      if (error) reject(error);
      else resolve(body);
    });
  });
}

module.exports = { sendMail };