const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const ApiKey = sequelize.define(
  'ApiKey',
  {
    key_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    api_key: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'active',
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    revoked_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'api_keys',
    timestamps: false,
  }
);

module.exports = ApiKey;
