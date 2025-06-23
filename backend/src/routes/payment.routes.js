const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const auth = require('../middleware/auth');
const onlyAdmin = require('../middleware/onlyAdmin');

// Stripe Webhook (DEBE IR ANTES DE express.json en app.js o aquí con raw body)
router.post(
  '/stripe-webhook',
  express.raw({ type: 'application/json' }),
  paymentController.stripeWebhook
);

// Crear sesión de Stripe Checkout para recarga de saldo
router.post('/stripe-checkout', auth, paymentController.createStripeCheckoutSession);

// Pago de IMEI para guest (y funciona también para usuario autenticado)
router.post('/stripe/imei-checkout', paymentController.createImeiStripeCheckoutSession);

// Obtener pago por Stripe Checkout Session ID (para frontend)
router.get('/by-session/:session_id', paymentController.getPaymentBySession);

// Crear pago manual (solo admin)
router.post('/manual', auth, onlyAdmin, paymentController.createManualPayment);

// Listar pagos del usuario autenticado
router.get('/my', auth, paymentController.getMyPayments);

// TODOS los pagos (admin)
router.get('/all', auth, onlyAdmin, paymentController.getAllPayments);

// Obtener pago por ID (admin/superadmin)
router.get('/:id', auth, onlyAdmin, paymentController.getPaymentById);

// Listar pagos de un usuario específico (admin)
router.get('/user/:user_id', auth, onlyAdmin, paymentController.getPaymentsByUser);

// Actualizar un pago (admin)
router.put('/:id', auth, onlyAdmin, paymentController.updatePayment);

// Eliminar un pago (admin)
router.delete('/:id', auth, onlyAdmin, paymentController.deletePayment);

module.exports = router;