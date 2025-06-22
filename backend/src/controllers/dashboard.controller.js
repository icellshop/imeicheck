const { User, ImeiOrder, Payment } = require('../models');
const { Op, fn, col, literal, Sequelize } = require('sequelize');

// 1. Quick stats
exports.quickStats = async (req, res) => {
  try {
    const users = await User.count();
    const orders = await ImeiOrder.count();
    const payments = await Payment.sum('amount', { where: { status: 'approved' } }) || 0;
    res.json({ users, orders, payments });
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