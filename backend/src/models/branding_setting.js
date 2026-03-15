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
