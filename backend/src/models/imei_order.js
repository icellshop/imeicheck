const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const User = require('./user'); // Importa el modelo User para la asociación

const ImeiOrder = sequelize.define('ImeiOrder', {
  order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  imei: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
  result: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  guest_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price_used: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  user_type_at_order: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  service_name_at_order: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  payment_intent_id: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'imei_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

// Asociación: una orden pertenece a un usuario
ImeiOrder.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

module.exports = ImeiOrder;