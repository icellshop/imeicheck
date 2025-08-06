const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

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
    type: DataTypes.STRING, // Si quieres guardar muchos IMEIs como JSON, puedes cambiar a DataTypes.TEXT
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
    type: DataTypes.TEXT,
    allowNull: true,
  },
  guest_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price_used: {
    type: DataTypes.DECIMAL(10, 2),
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
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'imei_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

// No pongas asociaciones aquí

module.exports = ImeiOrder;