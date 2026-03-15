const crypto = require('crypto');
const ApiKey = require('../models/apikey');
const User = require('../models/user');

// Generate a fresh 64-char hex API key (32 random bytes)
function generateRawKey() {
  return crypto.randomBytes(32).toString('hex');
}

// ── GET /api/apikeys/me ──────────────────────────────────────────────────────
// Returns the authenticated user's active key (plain key value included so
// the user can copy it). Revoked keys are NOT returned here.
exports.getMyKey = async (req, res) => {
  try {
    const key = await ApiKey.findOne({
      where: { user_id: req.user.user_id, status: 'active' },
      attributes: ['key_id', 'api_key', 'label', 'created_at', 'last_used_at'],
    });
    if (!key) return res.json({ active_key: null });
    res.json({ active_key: key });
  } catch (err) {
    console.error('getMyKey:', err);
    res.status(500).json({ error: 'Error fetching API key' });
  }
};

// ── POST /api/apikeys ────────────────────────────────────────────────────────
// Create a new active key. Any existing active key is revoked first.
exports.createKey = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { label } = req.body;

    // Revoke all existing active keys for this user
    await ApiKey.update(
      { status: 'revoked', revoked_at: new Date(), revoked_by: user_id },
      { where: { user_id, status: 'active' } }
    );

    const newKey = await ApiKey.create({
      user_id,
      api_key: generateRawKey(),
      status: 'active',
      label: label ? String(label).slice(0, 100) : null,
      created_at: new Date(),
    });

    res.status(201).json({
      message: 'New API key generated. Store it safely — this is the only time it is shown in full.',
      active_key: {
        key_id: newKey.key_id,
        api_key: newKey.api_key,
        label: newKey.label,
        created_at: newKey.created_at,
        last_used_at: null,
      },
    });
  } catch (err) {
    console.error('createKey:', err);
    res.status(500).json({ error: 'Error generating API key' });
  }
};

// ── DELETE /api/apikeys/revoke ───────────────────────────────────────────────
// Revoke the user's active key without generating a replacement.
exports.revokeKey = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const updated = await ApiKey.update(
      { status: 'revoked', revoked_at: new Date(), revoked_by: user_id },
      { where: { user_id, status: 'active' } }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ error: 'No active API key found' });
    }

    res.json({ message: 'API key revoked successfully.' });
  } catch (err) {
    console.error('revokeKey:', err);
    res.status(500).json({ error: 'Error revoking API key' });
  }
};

// ── GET /api/apikeys/history (superadmin only) ───────────────────────────────
// Returns ALL keys (active + revoked) for every user. For audit purposes only.
exports.adminHistory = async (req, res) => {
  try {
    const keys = await ApiKey.findAll({
      include: [{ model: User, attributes: ['user_id', 'email', 'username'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(keys);
  } catch (err) {
    console.error('adminHistory:', err);
    res.status(500).json({ error: 'Error fetching key history' });
  }
};
