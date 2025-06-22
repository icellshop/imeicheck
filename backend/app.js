const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const path = require('path');

dotenv.config();

const app = express();

// ======== CONFIGURA ORIGEN CORS CON MÚLTIPLES DOMINIOS ========
const FRONTEND_URLS = [
  'https://imeicheckfrontend.onrender.com',
  'https://imeicheck2.com',
  'https://www.imeicheck2.com',
  process.env.FRONTEND_URL,
].filter(Boolean); // quita undefined si FRONTEND_URL no está seteada

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requests sin origin (como herramientas de backend o curl)
      if (!origin) return callback(null, true);
      if (FRONTEND_URLS.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error(`No permitido por CORS. Origin: ${origin}`),
        false
      );
    },
    credentials: true,
  })
);

// =========== STRIPE WEBHOOK RAW BODY ===========
const stripeWebhookController = require('./src/controllers/payment.controller').stripeWebhook;
app.post(
  '/api/payments/stripe-webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhookController
);

// =========== JSON BODY PARSER (DESPUÉS DEL WEBHOOK) ===========
app.use(express.json());

// =========== IMPORTA Y USA RUTAS ===========
const userRoutes = require('./src/routes/user.routes');
const serviceRoutes = require('./src/routes/service.routes');
const imeiOrderRoutes = require('./src/routes/imei_order.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const countryListRoutes = require('./src/routes/countrylist.routes');
const paymentRoutes = require('./src/routes/payment.routes');

app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/imei-orders', imeiOrderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/countrylist', countryListRoutes);

// =========== SERVIR ESTÁTICOS PUBLIC ===========
app.use(express.static(path.join(__dirname, 'public')));

// =========== RUTAS LIMPIAS PARA ARCHIVOS HTML ===========
app.get('/add-funds',   (req, res) => res.sendFile(path.join(__dirname, 'public', 'add-funds.html')));
app.get('/orders-g',    (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-orders.html')));
app.get('/payments-g',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-payments.html')));
app.get('/services-g',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-services.html')));
app.get('/users-global',(req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-users.html')));
app.get('/admin',       (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/dashboard',   (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/imei-guest',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'imei-check-guest.html')));
app.get('/imei',        (req, res) => res.sendFile(path.join(__dirname, 'public', 'imei-check.html')));
app.get('/invoices',    (req, res) => res.sendFile(path.join(__dirname, 'public', 'invoices.html')));
app.get('/home',        (req, res) => res.sendFile(path.join(__dirname, 'public', 'landing-client.html')));
app.get('/login',       (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/order-history',(req, res) => res.sendFile(path.join(__dirname, 'public', 'order-history.html')));
app.get('/profile',     (req, res) => res.sendFile(path.join(__dirname, 'public', 'profile.html')));

// =========== ENDPOINT RAÍZ PARA RENDER/API ===========
app.get('/', (req, res) => {
  res.send('API imeicheck funcionando');
});

// =========== 404 HANDLER ===========
app.use((req, res, next) => {
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
      console.log(`CORS allowed origins: ${FRONTEND_URLS.join(', ')}`);
    });
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
})();

module.exports = app;