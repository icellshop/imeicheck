const express = require('express');
const router = express.Router();
const externalController = require('../controllers/external.controller');

/**
 * Public external integration endpoint.
 * No JWT auth — authentication is done via api_key + email in the request body.
 * Rate limiting should be applied at the reverse-proxy/infrastructure level.
 *
 * POST /api/external/imei-check
 * Body: { api_key, email, service_id, imei?, imeis? }
 */
router.post('/imei-check', externalController.externalImeiCheck);

module.exports = router;
