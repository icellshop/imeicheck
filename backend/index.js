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
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// --- VARIABLES DE ENTORNO ---
const API_KEY = process.env.IMEI_API_KEY;
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_FROM = process.env.MAILGUN_FROM || `noreply@${MAILGUN_DOMAIN}`;

// --- FUNCIÓN PARA ENVIAR EMAIL CON MAILGUN (HTML y Texto Plano) ---
async function sendMailgunEmail(to, subject, text, html = null) {
  const mailForm = new formData();
  mailForm.append('from', MAILGUN_FROM);
  mailForm.append('to', to);
  mailForm.append('subject', subject);
  mailForm.append('text', text);
  if (html) {
    mailForm.append('html', html);
  }

  const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: {
      ...mailForm.getHeaders(),
      'Authorization': 'Basic ' + Buffer.from('api:' + MAILGUN_API_KEY).toString('base64')
    },
    body: mailForm
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mailgun error: ${errorText}`);
  }
  return await response.json();
}

// --- ENDPOINT PARA CHECAR IMEI ---
app.post('/api/check-imei', async (req, res) => {
  const { imei, service_id, email } = req.body;
  console.log('Datos recibidos:', { imei, service_id, email });

  if (!imei || !/^\d{15}$/.test(imei)) {
    console.log('IMEI inválido');
    return res.status(400).json({ error: 'IMEI inválido' });
  }
  if (!service_id) {
    console.log('Servicio inválido');
    return res.status(400).json({ error: 'Servicio inválido' });
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.log('Email inválido');
    return res.status(400).json({ error: 'Email inválido' });
  }

  try {
    // Construye la URL de la API externa
    const apiUrl = `https://alpha.imeicheck.com/api/php-api/create?key=${encodeURIComponent(API_KEY)}&service=${encodeURIComponent(service_id)}&imei=${encodeURIComponent(imei)}`;

    // Haz la petición GET
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();
    console.log('Respuesta de API externa:', data);

    // Extrae sólo el campo 'result' (o un mensaje de error si no existe)
    const resultText = data.result || 'No se obtuvo resultado para este IMEI.';

    // Si el usuario pidió email, enviar sólo el campo result
    if (email) {
      const subject = 'Resultado de tu consulta IMEI en icellshop.mx';
      // Texto plano sin etiquetas HTML
      const text = `Hola,

Aquí tienes el resultado de tu consulta IMEI (${imei}):

${resultText.replace(/<[^>]+>/g, '')}

Gracias por usar icellshop.mx`;

      // HTML con formato
      const html = `<p>Hola,</p>
<p>Aquí tienes el resultado de tu consulta IMEI (${imei}):</p>
<p>${resultText}</p>
<p>Gracias por usar icellshop.mx</p>`;

      try {
        await sendMailgunEmail(email, subject, text, html);
        console.log('Correo enviado');
      } catch (mailErr) {
        // Ahora el error detallado aparecerá en tus logs
        console.error('Error al enviar email:', mailErr);
      }
    }

    // Devuelve sólo el campo 'result' al frontend, junto con success
    res.json({ result: resultText, success: true });
  } catch (err) {
    console.error('Error general en endpoint:', err);
    res.status(500).json({ error: 'Error al conectar con IMEI API' });
  }
});

// --- ARRANCAR SERVIDOR ---
app.listen(PORT, () => {
  console.log('API Backend escuchando en puerto', PORT);
});
