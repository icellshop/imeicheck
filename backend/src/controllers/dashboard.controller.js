const { User, ImeiOrder, Payment } = require('../models');
const { Op, fn, col, literal, Sequelize } = require('sequelize');

let fetch;
try {
  fetch = global.fetch || require('node-fetch');
} catch (e) {
  fetch = global.fetch;
}

async function getAllUsersLiveBalanceSum() {
  const [row] = await Payment.sequelize.query(
    `
      SELECT COALESCE(SUM(GREATEST(0, COALESCE(p.total_paid, 0) - COALESCE(o.total_spent, 0))), 0) AS total_live_balance
      FROM users u
      LEFT JOIN (
        SELECT user_id, SUM(COALESCE(credited_amount, amount, 0)) AS total_paid
        FROM payments
        WHERE status = 'approved'
        GROUP BY user_id
      ) p ON p.user_id = u.user_id
      LEFT JOIN (
        SELECT user_id, SUM(COALESCE(price_used, 0)) AS total_spent
        FROM imei_orders
        WHERE status IN ('completed', 'partial')
        GROUP BY user_id
      ) o ON o.user_id = u.user_id
    `,
    { type: Sequelize.QueryTypes.SELECT }
  );

  return Number(row?.total_live_balance || 0);
}

async function getUpstreamImeiCheckBalance() {
  const key = process.env.IMEI_API_KEY;
  if (!key) {
    return { value: null, error: 'IMEI_API_KEY is not configured.' };
  }

  const endpoint = `https://alpha.imeicheck.com/api/php-api/balance?key=${encodeURIComponent(key)}`;

  try {
    const response = await fetch(endpoint, { method: 'GET' });
    const rawText = await response.text();

    let parsed = null;
    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch (_err) {
      parsed = null;
    }

    const candidates = [
      parsed?.balance,
      parsed?.credit,
      parsed?.credits,
      parsed?.account_balance,
      parsed?.data?.balance,
      parsed?.data?.credit,
      rawText,
    ];

    let value = null;
    for (const candidate of candidates) {
      if (candidate === null || typeof candidate === 'undefined') continue;
      const numeric = Number(String(candidate).replace(/[^0-9.-]/g, ''));
      if (Number.isFinite(numeric)) {
        value = numeric;
        break;
      }
    }

    return {
      value,
      raw: parsed || rawText,
      http_status: response.status,
      ok: response.ok,
      error: response.ok ? null : `Upstream balance endpoint returned HTTP ${response.status}`,
    };
  } catch (error) {
    return { value: null, error: error.message || 'Could not reach upstream balance endpoint.' };
  }
}

// 1. Quick stats
exports.quickStats = async (req, res) => {
  try {
    const users = await User.count();
    const orders = await ImeiOrder.count();
    const payments = await Payment.sum('amount', { where: { status: 'approved' } }) || 0;

    let users_live_balance_total = null;
    let imeicheck_upstream_balance = null;

    if (req.user?.user_type === 'superadmin') {
      users_live_balance_total = await getAllUsersLiveBalanceSum();
      imeicheck_upstream_balance = await getUpstreamImeiCheckBalance();
    }

    res.json({
      users,
      orders,
      payments,
      users_live_balance_total,
      imeicheck_upstream_balance,
    });
  } catch (e) {
    res.status(500).json({ error: 'Error fetching quick stats', details: e.message });
  }
};

// 2. Order statistics (total, completed, failed, pending)
exports.orderStats = async (req, res) => {
  try {
    const total = await ImeiOrder.count();
    const completed = await ImeiOrder.count({ where: { status: 'completed' } });
    const failed = await ImeiOrder.count({ where: { status: 'failed' } });
    const pending = await ImeiOrder.count({ where: { status: 'pending' } });
    res.json({ total, completed, failed, pending });
  } catch (e) {
    res.status(500).json({ error: 'Error fetching order stats', details: e.message });
  }
};

// 3. Registered users with date filter
exports.registeredUsersCount = async (req, res) => {
  try {
    const { start, end } = req.query;
    const where = {};
    if (start) where.created_at = { [Op.gte]: start };
    if (end) where.created_at = { ...where.created_at, [Op.lte]: end + ' 23:59:59' };
    const count = await User.count({ where });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: 'Error fetching registered users count', details: e.message });
  }
};

// 4. Services usage (%) for pie chart
exports.servicesUsage = async (req, res) => {
  try {
    // Count orders grouped by service_name_at_order
    const usage = await ImeiOrder.findAll({
      attributes: [
        'service_name_at_order',
        [fn('COUNT', col('order_id')), 'count']
      ],
      group: ['service_name_at_order'],
      order: [[literal('count'), 'DESC']]
    });
    res.json(
      usage.map(u => ({
        service: u.service_name_at_order || 'Other',
        count: parseInt(u.get('count'))
      }))
    );
  } catch (e) {
    res.status(500).json({ error: 'Error fetching services usage', details: e.message });
  }
};

// 5. Approved payments by month (last 12 months or filter) and payments list
exports.paymentsApprovedTimeline = async (req, res) => {
  try {
    const { start, end } = req.query;
    const where = { status: 'approved' };
    let startDate, endDate;
    if (start) startDate = new Date(start + '-01');
    if (end) {
      const [y, m] = end.split('-');
      endDate = new Date(y, m, 0, 23, 59, 59, 999);
    }
    if (startDate) where.created_at = { [Op.gte]: startDate };
    if (endDate) where.created_at = { ...where.created_at, [Op.lte]: endDate };

    // Months to show (default last 12)
    let months = [];
    if (!start || !end) {
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
    } else {
      months = [];
      let d = new Date(startDate);
      while (d <= endDate) {
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        d.setMonth(d.getMonth() + 1);
      }
    }

    // PostgreSQL: use TO_CHAR for grouping by month
    const groupByMonth = Sequelize.literal("TO_CHAR(created_at, 'YYYY-MM')");
    const results = await Payment.findAll({
      attributes: [
        [groupByMonth, 'month'],
        [fn('SUM', col('amount')), 'total']
      ],
      where,
      group: [groupByMonth],
      order: [[literal('month'), 'ASC']]
    });

    const totalsByMonth = {};
    results.forEach(r => {
      totalsByMonth[r.get('month')] = parseFloat(r.get('total'));
    });
    // Fill months with 0 if no payments
    const totals = months.map(m => totalsByMonth[m] || 0);

    // Payments list for the period
    const { User: UserModel } = require('../models');
    const payments = await Payment.findAll({
      where,
      include: [{ model: UserModel, attributes: ['email'] }],
      order: [['created_at', 'DESC']],
      attributes: ['amount', 'user_id']
    });
    const paymentsList = payments.map(p => ({
      user_email: p.User?.email || '',
      amount: parseFloat(p.amount)
    }));

    res.json({ months, totals, payments: paymentsList });
  } catch (e) {
    res.status(500).json({ error: 'Error fetching payments timeline', details: e.message });
  }
};