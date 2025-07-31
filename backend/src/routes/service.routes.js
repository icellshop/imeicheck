const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const auth = require('../middleware/auth');
const onlyAdmin = require('../middleware/onlyAdmin');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// PÚBLICO: ver servicios
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// SOLO ADMIN/SUPERADMIN: crear, actualizar, eliminar servicios
router.post('/', auth, onlyAdmin, serviceController.createService);
router.put('/:id', auth, onlyAdmin, serviceController.updateService);
router.delete('/:id', auth, onlyAdmin, serviceController.deleteService);

// SOLO ADMIN/SUPERADMIN: actualización masiva y carga masiva desde Excel
router.put('/bulk', auth, onlyAdmin, serviceController.bulkUpdate);
router.post('/bulk-upload', auth, onlyAdmin, upload.single('file'), serviceController.bulkCreateFromExcel);

module.exports = router;