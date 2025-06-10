const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Seguridad para dominios permitidos
app.use(cors({
  origin: ['https://TUDOMINIO.com', 'http://localhost:3000'] // Cambia por tu dominio real
}));
app.use(express.json());

const API_URL = 'https://dhru.checkimei.com/api/order';
const API_USER = 'ArturoDLT973';
const API_KEY = 'o2Skl-Oh3f2-0WzS3-NkWuu-UNZT7-jjIwg';

app.post('/api/check-imei', async (req, res) => {
  const { imei, service_id } = req.body;

  if (!imei || !/^\d{15}$/.test(imei)) {
    return res.status(400).json({ error: 'IMEI inválido' });
  }

  if (!service_id) {
    return res.status(400).json({ error: 'Servicio inválido' });
  }

  try {
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
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al conectar con IMEI API' });
  }
});

app.listen(PORT, () => {
  console.log('API Backend escuchando en puerto', PORT);
});