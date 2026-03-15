const express = require('express');
const router = express.Router();
const apikeyController = require('../controllers/apikey.controller');
const auth = require('../middleware/auth');
const onlyAdmin = require('../middleware/onlyAdmin');

// User: get own active key
router.get('/me', auth, apikeyController.getMyKey);

// User: generate new key (revokes previous active key automatically)
router.post('/', auth, apikeyController.createKey);

// User: revoke active key without creating a replacement
router.delete('/revoke', auth, apikeyController.revokeKey);

// Super-admin: audit log of all keys ever issued
router.get('/admin/history', auth, onlyAdmin, apikeyController.adminHistory);

module.exports = router;
