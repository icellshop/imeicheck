const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const formData = require('form-data');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors({
  origin: ['https://icellshop.mx', 'http://localhost:3000']
}));
app.use(express.json());

// --- SERVIR FRONTEND ---
// Sirve todos los archivos estáticos de la carpeta frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Cuando visitan "/", devuelve el index.html del frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// --- VARIABLES DE ENTORNO ---
// (Asegúrate de tener estas variables configuradas en Render)
const API_URL = process.env.IMEI_API_URL;
const API_USER = process.env.IMEI_API_USER;
const API_KEY = process.env.IMEI_API_KEY;
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_FROM = process.env.MAILGUN_FROM || `noreply@${MAILGUN_DOMAIN}`;

// --- FUNCIÓN PARA ENVIAR EMAIL CON MAILGUN ---
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

// --- ENDPOINT PARA CHECAR IMEI ---
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
    // Consultar API externa
    const apiResponse = await fetch(API_URL, {
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
    const data = await apiResponse.json();

    // Si el usuario pidió email, enviarlo
    if (email) {
      const subject = 'Resultado de tu consulta IMEI en icellshop.mx';
      const text = `Hola,

Aquí tienes el resultado de tu consulta IMEI (${imei}):

${JSON.stringify(data, null, 2)}

Gracias por usar icellshop.mx`;

      try {
        await sendMailgunEmail(email, subject, text);
      } catch (mailErr) {
        // No detener el flujo si falla el correo, solo loguear
        console.error('Error al enviar email:', mailErr);
      }
    }

    res.json({ ...data, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al conectar con IMEI API' });
  }
});

// --- ARRANCAR SERVIDOR ---
app.listen(PORT, () => {
  console.log('API Backend escuchando en puerto', PORT);
});
