const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());

// =========== STRIPE WEBHOOK RAW BODY ===========
// Importa SOLO el controlador para esta ruta, no todo paymentRoutes
const stripeWebhookController = require('./src/controllers/payment.controller').stripeWebhook;
app.post(
  '/api/payments/stripe-webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhookController
);

// =========== JSON BODY PARSER (DESPUÉS DEL WEBHOOK) ===========
app.use(express.json());

// =========== STATIC FILES ===========
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, '../frontend')));

// =========== IMPORTA Y USA RUTAS ===========
const userRoutes = require('./src/routes/user.routes');
const serviceRoutes = require('./src/routes/service.routes');
const imeiOrderRoutes = require('./src/routes/imei_order.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const countryListRoutes = require('./src/routes/countrylist.routes');
const paymentRoutes = require('./src/routes/payment.routes'); // <-- Aquí sí importas las rutas

app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/imei-orders', imeiOrderRoutes);
// ¡Ahora SÍ van las demás rutas de payments, SIN el webhook!
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/countrylist', countryListRoutes);

// =========== FRIENDLY ROUTES FOR HTML ===========
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/landing-guest.html'));
});
app.get(['/login', '/register'], (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// =========== 404 HANDLER ===========
app.use((req, res, next) => {
  if (req.accepts('html')) {
    return res.status(404).sendFile(path.join(__dirname, '../frontend/404.html'));
  }
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// =========== ERROR HANDLER GLOBAL ===========
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 8080;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
})();

module.exports = app;