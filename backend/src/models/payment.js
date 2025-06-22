const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const User = require('./user');

const Payment = sequelize.define('Payment', {
  payment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: { // Monto total pagado (incluye comisión)
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  credited_amount: { // Monto acreditado al usuario (sin comisión)
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payment_reference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stripe_payment_intent_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  stripe_checkout_session_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  balance_before: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  balance_after: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // No incluyas updated_at aquí porque no quieres que Sequelize lo controle automáticamente
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Tu tabla solo tiene created_at, no actualiza updated_at
  underscored: true,
});

// Relaciones (define solo una vez en models/index.js idealmente)
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = Payment;