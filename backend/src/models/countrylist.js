const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const CountryList = sequelize.define('countrylist', {
  country_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'countrylist',
  timestamps: false
});

module.exports = CountryList;