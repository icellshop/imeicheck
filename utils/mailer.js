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

/**
 * Envía un correo usando Mailgun vía nodemailer.
 * 
 * @param {Object} options
 * @param {string} options.to - Correo de destino.
 * @param {string} [options.type] - Tipo de correo ('verification', 'password_reset', etc).
 * @param {Object} [options.data] - Datos adicionales para el correo (ejemplo: { code }).
 * @param {string} [options.html] - Contenido HTML personalizado.
 * @param {string} [options.subject] - Subject personalizado (opcional).
 */
async function sendMail({ to, type, data = {}, html, subject }) {
  let subjectFinal = subject || '';
  let text = '';
  let htmlContent = html || '';

  if (type === 'verification') {
    subjectFinal = subjectFinal || 'Código de verificación de correo';
    text = `Tu código de verificación es: ${data.code}`;
    if (!htmlContent) {
      htmlContent = `<p>Tu código de verificación es: <b>${data.code}</b></p>`;
    }
  } else if (type === 'password_reset') {
    subjectFinal = subjectFinal || 'Código de recuperación de contraseña';
    text = `Tu código de recuperación es: ${data.code}`;
    if (!htmlContent) {
      htmlContent = `<p>Tu código de recuperación es: <b>${data.code}</b></p>`;
    }
  } else if (!subjectFinal) {
    subjectFinal = 'Notificación IMEICheck';
    text = 'Tienes una nueva notificación.';
    if (!htmlContent) {
      htmlContent = `<p>Tienes una nueva notificación.</p>`;
    }
  }

  const mailOptions = {
    from: process.env.MAILGUN_FROM,
    to,
    subject: subjectFinal,
    text,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId, 'a', to, '| Subject:', subjectFinal);
    return info;
  } catch (error) {
    console.error('Error enviando correo:', error);
    throw error;
  }
}

module.exports = { sendMail };