const express = require('express');
const router = express.Router();
const externalController = require('../controllers/external.controller');

/**
 * Public external integration endpoint.
 * No JWT auth — authentication is done via api_key + email in the request body.
 * Rate limiting should be applied at the reverse-proxy/infrastructure level.
 *
 * POST /api/external/init
 * Body: { api_key, email }
 *
 * POST /api/external/imei-check
 * Body: { confirmation_token?, api_key?, email?, service_id, imei?, imeis? }
 */
router.post('/init', externalController.initConfirmation);
router.post('/imei-check', externalController.externalImeiCheck);

module.exports = router;
