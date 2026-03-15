const BrandingSetting = require('../models/branding_setting');

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
]);

async function getOrCreateBrandingSetting() {
  let settings = await BrandingSetting.findOne({ order: [['setting_id', 'ASC']] });
  if (!settings) {
    settings = await BrandingSetting.create({
      logo_data_url: null,
      updated_by: null,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
  return settings;
}

exports.getBranding = async (_req, res) => {
  try {
    const settings = await getOrCreateBrandingSetting();
    return res.json({
      logo_url: settings.logo_data_url || null,
      updated_at: settings.updated_at || settings.created_at || null,
    });
  } catch (err) {
    console.error('getBranding:', err);
    return res.status(500).json({ error: 'Error fetching branding settings' });
  }
};

exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Logo file is required' });
    }

    if (!ALLOWED_MIME_TYPES.has(req.file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported image type. Use PNG, JPG, WEBP or SVG.' });
    }

    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(413).json({ error: 'Logo file too large. Maximum size is 2MB.' });
    }

    const settings = await getOrCreateBrandingSetting();
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    settings.logo_data_url = dataUrl;
    settings.updated_by = req.user?.user_id || null;
    settings.updated_at = new Date();
    await settings.save();

    return res.json({
      message: 'Logo updated successfully.',
      logo_url: settings.logo_data_url,
      updated_at: settings.updated_at,
    });
  } catch (err) {
    console.error('uploadLogo:', err);
    return res.status(500).json({ error: 'Error uploading logo' });
  }
};
