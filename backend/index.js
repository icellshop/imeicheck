const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const formData = require('form-data');

const app = express();
const PORT = process.env.PORT || 8080;

// Seguridad para dominios permitidos
app.use(cors({
  origin: ['https://icellshop.mx', 'http://localhost:3000']
}));
app.use(express.json());

// Variables de entorno
const API_URL = process.env.IMEI_API_URL;
const API_USER = process.env.IMEI_API_USER;
const API_KEY = process.env.IMEI_API_KEY;

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_FROM = process.env.MAILGUN_FROM || `noreply@${MAILGUN_DOMAIN}`;

// Función para enviar correo con Mailgun
async function sendMailgunEmail(to, subject, text) {
  const mailForm = new formData();
  mailForm.append('from', MAILGUN_FROM);
  mailForm.append('to', to);
  mailForm.append('subject', subject);
  mailForm.append('text', text);

  const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: {
      ...mailForm.getHeaders(),
      'Authorization': 'Basic ' + Buffer.from('api:' + MAILGUN_API_KEY).toString('base64')
    },
    body: mailForm
  });

  if (!response.ok) {
    throw new Error('No se pudo enviar el correo.');
  }
  return await response.json();
}

app.post('/api/check-imei', async (req, res) => {
  const { imei, service_id, email } = req.body;

  if (!imei || !/^\d{15}$/.test(imei)) {
    return res.status(400).json({ error: 'IMEI inválido' });
  }

  if (!service_id) {
    return res.status(400).json({ error: 'Servicio inválido' });
  }

  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  try {
    // Consulta IMEI API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: API_USER,
        api_key: API_KEY,
        action: 'place_order',
        service_id,
        imei
      })
    });

    const data = await response.json();

    // Si el usuario puso email, envía el resultado por correo
    if (email) {
      const subject = 'Resultado de tu consulta IMEI en icellshop.mx';
      const text = `Hola,
      
Aquí tienes el resultado de tu consulta IMEI (${imei}):

${JSON.stringify(data, null, 2)}

Gracias por usar icellshop.mx`;

      try {
        await sendMailgunEmail(email, subject, text);
      } catch (mailErr) {
        // No detiene el flujo, pero lo reporta
        console.error('Error al enviar email:', mailErr);
      }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al conectar con IMEI API' });
  }
});

app.listen(PORT, () => {
  console.log('API Backend escuchando en puerto', PORT);
});
