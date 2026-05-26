const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const BrandingSetting = sequelize.define(
  'BrandingSetting',
  {
    setting_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    logo_data_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    stripe_fee_percent: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 3.6,
    },
    stripe_fee_fixed: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.30,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'branding_settings',
    timestamps: false,
  }
);

module.exports = BrandingSetting;
