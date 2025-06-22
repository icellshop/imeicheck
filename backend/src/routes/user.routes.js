const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const onlyAdmin = require('../middleware/onlyAdmin');

// Registro y login (públicos)
router.post('/register', userController.register);
router.post('/login', userController.login);

// Recuperación de contraseña (públicos)
router.post('/request-password-reset', userController.requestPasswordReset);
router.post('/reset-password', userController.resetPassword);

// Cambiar contraseña
router.post('/change-password', auth, userController.changePassword);

// Verificación de email (públicos)
router.post('/verify-email', userController.verifyEmail);
router.post('/resend-verification-email', userController.resendVerificationEmail);

// Autocompletar email (debe ir antes de rutas que usan :id)
router.get('/search', onlyAdmin, userController.searchByEmail);

// Admin list y update type
router.get('/admin-list', auth, onlyAdmin, userController.adminList);
router.put('/:id/update-type', auth, onlyAdmin, userController.updateType);

// Perfil propio (accesible para cualquier usuario autenticado)
router.get('/me', auth, userController.me);

// Admin/superadmin: gestiona usuarios
router.get('/', auth, onlyAdmin, userController.getAllUsers);
router.get('/:id', auth, onlyAdmin, userController.getUserById);
router.put('/:id', auth, onlyAdmin, userController.updateUser);
router.delete('/:id', auth, onlyAdmin, userController.deleteUser);

// Recarga manual (sólo admin, placeholder)
router.post('/:id/recharge', auth, onlyAdmin, userController.rechargeUserBalance);

module.exports = router;