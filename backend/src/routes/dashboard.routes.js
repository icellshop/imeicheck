const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');
const onlyAdmin = require('../middleware/onlyAdmin');

router.get('/quick-stats', auth, onlyAdmin, dashboardController.quickStats);
router.get('/order-stats', auth, onlyAdmin, dashboardController.orderStats);
router.get('/registered-users-count', auth, onlyAdmin, dashboardController.registeredUsersCount);
router.get('/services-usage', auth, onlyAdmin, dashboardController.servicesUsage);
router.get('/payments-approved-timeline', auth, onlyAdmin, dashboardController.paymentsApprovedTimeline);

module.exports = router;