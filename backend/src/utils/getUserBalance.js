const Payment = require('../models/payment');
const IMEIOrder = require('../models/imei_order');

// Calcula el balance real de un usuario: suma de pagos aprobados menos total de órdenes completadas
async function getUserBalance(user_id, options = {}) {
  const { transaction } = options;

  // Suma de pagos aprobados
  const { sum: paymentsSum = 0 } = await Payment.findOne({
    attributes: [[
      Payment.sequelize.fn(
        'SUM',
        Payment.sequelize.fn(
          'COALESCE',
          Payment.sequelize.col('credited_amount'),
          Payment.sequelize.col('amount'),
          0
        )
      ),
      'sum'
    ]],
    where: { user_id, status: 'approved' },
    transaction,
    raw: true,
  }) || {};

  // Suma de cargos por órdenes completadas
  const { sum: ordersSum = 0 } = await IMEIOrder.findOne({
    attributes: [[IMEIOrder.sequelize.fn('SUM', IMEIOrder.sequelize.col('price_used')), 'sum']],
    where: { user_id, status: 'completed' },
    transaction,
    raw: true,
  }) || {};

  // El balance es la diferencia (nunca negativo)
  return Math.max(0, Number(paymentsSum || 0) - Number(ordersSum || 0));
}

module.exports = getUserBalance;