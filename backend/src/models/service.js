const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Service = sequelize.define('Service', {
  service_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  service_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  cost: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  object: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  limit: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  price_guest: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0,
  },
  price_registered: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0,
  },
  price_premium: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0,
  },
  price_pro: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  }
}, {
  tableName: 'services',
  timestamps: false,
});

module.exports = Service;