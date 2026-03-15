const express = require('express');
const multer = require('multer');
const brandingController = require('../controllers/branding.controller');
const auth = require('../middleware/auth');
const onlySuperAdmin = require('../middleware/onlySuperAdmin');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', brandingController.getBranding);
router.put('/logo', auth, onlySuperAdmin, upload.single('logo'), brandingController.uploadLogo);

module.exports = router;
