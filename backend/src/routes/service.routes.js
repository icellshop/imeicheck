const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const auth = require('../middleware/auth');
const onlyAdmin = require('../middleware/onlyAdmin');

// PÚBLICO: ver servicios
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

router.put('/bulk', auth, onlyAdmin, serviceController.bulkUpdate);


// SOLO ADMIN/SUPERADMIN
router.post('/', auth, onlyAdmin, serviceController.createService);
router.put('/:id', auth, onlyAdmin, serviceController.updateService);
router.delete('/:id', auth, onlyAdmin, serviceController.deleteService);

module.exports = router;