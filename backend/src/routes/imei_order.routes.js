const express = require('express');
const router = express.Router();
const imeiOrderController = require('../controllers/imei_order.controller');
const auth = require('../middleware/auth');
const onlyAdmin = require('../middleware/onlyAdmin');

// Crear orden (guest o usuario autenticado)
router.post('/', auth, imeiOrderController.createOrder);

// Historial del usuario autenticado
router.get('/me', auth, imeiOrderController.getMyOrders); // <-- CORRECTO: /me para historial propio

// Todas las órdenes (admin/superadmin)
router.get('/', auth, onlyAdmin, imeiOrderController.getAllOrders);
router.get('/:id', auth, onlyAdmin, imeiOrderController.getOrderById);

// Buscar orden por session_id de Stripe (para frontend loader)
router.get('/by-session/:session_id', imeiOrderController.getOrderBySession);


router.get('/admin-list', auth, onlyAdmin, imeiOrderController.adminList);

// Actualizar status y resultado de una orden (admin/sistema/worker)
router.patch('/:id/status', imeiOrderController.updateOrderStatus);

module.exports = router;