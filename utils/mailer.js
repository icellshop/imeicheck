const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  secure: false,
  auth: {
    user: `postmaster@${process.env.MAILGUN_DOMAIN}`,
    pass: process.env.MAILGUN_API_KEY,
  },
});

async function sendMail({ to, type, data, html }) {
  let subject = '';
  let text = '';
  let htmlContent = html || '';

  if (type === 'verification') {
    subject = 'Código de verificación de correo';
    text = `Tu código de verificación es: ${data.code}`;
    if (!htmlContent) {
      htmlContent = `<p>Tu código de verificación es: <b>${data.code}</b></p>`;
    }
  } else if (type === 'password_reset') {
    subject = 'Código de recuperación de contraseña';
    text = `Tu código de recuperación es: ${data.code}`;
    if (!htmlContent) {
      htmlContent = `<p>Tu código de recuperación es: <b>${data.code}</b></p>`;
    }
  } else {
    subject = 'Notificación IMEICheck';
    text = 'Tienes una nueva notificación.';
    if (!htmlContent) {
      htmlContent = `<p>Tienes una nueva notificación.</p>`;
    }
  }

  const mailOptions = {
    from: process.env.MAILGUN_FROM,
    to,
    subject,
    text,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId, 'a', to);
    return info;
  } catch (error) {
    console.error('Error enviando correo:', error);
    throw error;
  }
}

module.exports = { sendMail };