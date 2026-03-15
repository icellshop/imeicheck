/**
 * External API Controller
 * ──────────────────────────────────────────────────────────────────────────
 * This controller exposes a public endpoint that third-party platforms
 * (e.g. probuyer.org) can call to run IMEI checks using a user's
 * imeicheck2.com API key. The caller must provide:
 *
 *   POST /api/external/imei-check
 *   Body (JSON):
 *     {
 *       "api_key":    "<64-char hex key>",
 *       "email":      "<user email registered in imeicheck2.com>",
 *       "service_id": <numeric service id>,
 *       "imei":       "<single IMEI or SN>",
 *       "imeis":      ["optional", "array", "for", "bulk"]  // max 50
 *     }
 *
 * Response (always JSON, even on errors):
 *   {
 *     "success": true|false,
 *     "results": [...],          // per-IMEI result array
 *     "order_id": 12345,
 *     "status": "completed|partial|failed",
 *     "balance": 4.37            // caller's remaining balance after charge
 *   }
 * ──────────────────────────────────────────────────────────────────────────
 */
const ApiKey = require('../models/apikey');
const User = require('../models/user');
const Service = require('../models/service');
const IMEIOrder = require('../models/imei_order');
const sequelize = require('../../config/db');
const getUserBalance = require('../utils/getUserBalance');
const crypto = require('crypto');

let fetch;
try {
  fetch = global.fetch || require('node-fetch');
} catch (e) {
  fetch = global.fetch;
}

function generateConfirmationToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getConfirmationExpiry() {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);
  return expiry;
}

async function resolveExternalAuth({ confirmation_token, api_key, email }) {
  if (confirmation_token) {
    const keyRecord = await ApiKey.findOne({
      where: { confirmation_token, status: 'active' },
    });

    if (!keyRecord) {
      return { error: { status: 401, body: { success: false, error: 'Invalid confirmation token.' } } };
    }

    if (!keyRecord.confirmation_expires_at || new Date(keyRecord.confirmation_expires_at) < new Date()) {
      await keyRecord.update({
        confirmation_token: null,
        confirmation_issued_at: null,
        confirmation_expires_at: null,
      });
      return { error: { status: 401, body: { success: false, error: 'Confirmation token expired.' } } };
    }

    const user = await User.findByPk(keyRecord.user_id);
    if (!user) {
      return { error: { status: 401, body: { success: false, error: 'User account not found.' } } };
    }

    if (!user.email_verified) {
      return { error: { status: 403, body: { success: false, error: 'Account email is not verified.' } } };
    }

    if (email && user.email.toLowerCase() !== String(email).trim().toLowerCase()) {
      return { error: { status: 401, body: { success: false, error: 'Email does not match the API key owner.' } } };
    }

    return { keyRecord, user, usedConfirmationToken: true };
  }

  if (!api_key || !email) {
    return {
      error: {
        status: 400,
        body: { success: false, error: 'Provide confirmation_token or api_key + email.' },
      },
    };
  }

  const keyRecord = await ApiKey.findOne({ where: { api_key, status: 'active' } });
  if (!keyRecord) {
    return { error: { status: 401, body: { success: false, error: 'Invalid or revoked API key.' } } };
  }

  const user = await User.findByPk(keyRecord.user_id);
  if (!user) {
    return { error: { status: 401, body: { success: false, error: 'User account not found.' } } };
  }

  if (user.email.toLowerCase() !== String(email).trim().toLowerCase()) {
    return {
      error: {
        status: 401,
        body: { success: false, error: 'Email does not match the API key owner.' },
      },
    };
  }

  if (!user.email_verified) {
    return { error: { status: 403, body: { success: false, error: 'Account email is not verified.' } } };
  }

  return { keyRecord, user, usedConfirmationToken: false };
}

// ── POST /api/external/init ────────────────────────────────────────────────
exports.initConfirmation = async (req, res) => {
  try {
    const { api_key, email } = req.body;

    const authResult = await resolveExternalAuth({ api_key, email });
    if (authResult.error) {
      return res.status(authResult.error.status).json(authResult.error.body);
    }

    const confirmationToken = generateConfirmationToken();
    const expiresAt = getConfirmationExpiry();

    await authResult.keyRecord.update({
      confirmation_token: confirmationToken,
      confirmation_issued_at: new Date(),
      confirmation_expires_at: expiresAt,
    });

    return res.json({
      success: true,
      confirmed: true,
      email: authResult.user.email,
      confirmation_token: confirmationToken,
      expires_at: expiresAt.toISOString(),
      expires_in: 600,
    });
  } catch (err) {
    console.error('initConfirmation error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ── POST /api/external/imei-check ───────────────────────────────────────────
exports.externalImeiCheck = async (req, res) => {
  let transaction = null;

  try {
    const { confirmation_token, api_key, email, service_id, imei, imeis } = req.body;

    // ── 1. Basic input validation ──────────────────────────────────────────
    if (!service_id || (!confirmation_token && (!api_key || !email))) {
      return res.status(400).json({
        success: false,
        error: 'service_id and either confirmation_token or api_key + email are required.',
      });
    }

    // ── 2. Validate auth via confirmation token or raw api key ─────────────
    const authResult = await resolveExternalAuth({ confirmation_token, api_key, email });
    if (authResult.error) {
      return res.status(authResult.error.status).json(authResult.error.body);
    }

    const { keyRecord, user, usedConfirmationToken } = authResult;

    // ── 4. Validate service ────────────────────────────────────────────────
    const service = await Service.findByPk(service_id);
    if (!service || !service.active) {
      return res.status(404).json({ success: false, error: 'Service not found or inactive.' });
    }

    // ── 5. Build IMEI list ─────────────────────────────────────────────────
    let imeisArr = [];
    if (Array.isArray(imeis)) imeisArr = imeis;
    else if (imei) imeisArr = [imei];
    imeisArr = imeisArr.map((i) => String(i).trim()).filter(Boolean);

    if (imeisArr.length === 0 || imeisArr.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Provide between 1 and 50 IMEI/SN values.',
      });
    }
    for (const i of imeisArr) {
      if (!/^\d{15}$/.test(i) && !/^[A-Za-z0-9]{8,25}$/.test(i)) {
        return res.status(400).json({ success: false, error: `Invalid IMEI/SN: ${i}` });
      }
    }

    // ── 6. Determine price based on user type ─────────────────────────────
    const user_type = user.user_type || 'registered';
    let unit_price = Number(service.price_registered);
    if (user_type === 'pro') unit_price = Number(service.price_pro);
    else if (user_type === 'premium') unit_price = Number(service.price_premium);

    if (Number.isNaN(unit_price) || unit_price <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid service price for this account type.' });
    }

    // ── 7. DB transaction: lock user row, check balance ───────────────────
    transaction = await sequelize.transaction();

    await User.findByPk(user.user_id, { transaction, lock: transaction.LOCK.UPDATE });

    const estimated_total = unit_price * imeisArr.length;
    const currentBalance = await getUserBalance(user.user_id, { transaction });

    if (currentBalance < estimated_total) {
      await transaction.rollback();
      transaction = null;
      return res.status(402).json({
        success: false,
        error: 'Insufficient balance.',
        available_balance: currentBalance,
        required_balance: estimated_total,
      });
    }

    // ── 8. Create order record ─────────────────────────────────────────────
    const newOrder = await IMEIOrder.create(
      {
        imei: JSON.stringify(imeisArr),
        service_id,
        user_id: user.user_id,
        guest_email: null,
        status: 'pending',
        created_at: new Date(),
        price_used: estimated_total,
        user_type_at_order: user_type,
        service_name_at_order: service.service_name,
        currency: 'USD',
        ip_address: req.ip,
      },
      { transaction }
    );

    // Track last_used_at on the key (non-blocking — outside transaction)
    ApiKey.update(
      { last_used_at: new Date() },
      { where: { key_id: keyRecord.key_id } }
    ).catch(() => {});

    // ── 9. Call the upstream IMEI API for each IMEI ───────────────────────
    const apiResults = [];
    const clientResults = [];

    for (const oneImei of imeisArr) {
      const payload = {
        key: process.env.IMEI_API_KEY,
        imei: oneImei,
        service: service_id,
      };
      try {
        const apiRes = await fetch(process.env.IMEI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const apiData = await apiRes.json();
        const succeeded =
          apiData.success === true || apiData.status === 'success';

        apiResults.push({ imei: oneImei, api: apiData, status: succeeded ? 'completed' : 'failed' });
        clientResults.push({
          imei: oneImei,
          status: succeeded ? 'completed' : 'failed',
          result: apiData.result || null,
          object: apiData.object || null,
        });
      } catch (fetchErr) {
        apiResults.push({ imei: oneImei, api: null, status: 'failed' });
        clientResults.push({
          imei: oneImei,
          status: 'failed',
          result: null,
          error: 'Upstream API error',
        });
      }
    }

    // ── 10. Calculate charge based on completed calls only ────────────────
    const completedCount = apiResults.filter((r) => r.status === 'completed').length;
    const chargedAmount = completedCount * unit_price;
    const allOk = completedCount === imeisArr.length;
    const anyOk = completedCount > 0;
    const finalStatus = allOk ? 'completed' : anyOk ? 'partial' : 'failed';

    newOrder.result = JSON.stringify(apiResults);
    newOrder.status = finalStatus;
    newOrder.price_used = chargedAmount;
    await newOrder.save({ transaction });

    await transaction.commit();
    transaction = null;

    // ── 11. Get updated balance (outside transaction) ─────────────────────
    const newBalance = await getUserBalance(user.user_id);

    if (usedConfirmationToken) {
      await keyRecord.update({
        confirmation_token: null,
        confirmation_issued_at: null,
        confirmation_expires_at: null,
      });
    }

    // ── 12. Respond ───────────────────────────────────────────────────────
    return res.json({
      success: anyOk,
      order_id: newOrder.order_id,
      status: finalStatus,
      results: clientResults,
      charged: chargedAmount,
      balance: newBalance,
    });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (_) {}
    }
    console.error('externalImeiCheck error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};
