const User = require('./user');
const Service = require('./service');
const ImeiOrder = require('./imei_order');
const Payment = require('./payment');

// Asociaciones
User.hasMany(ImeiOrder, { foreignKey: 'user_id' });
ImeiOrder.belongsTo(User, { foreignKey: 'user_id' }); // Sin alias aquí

User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' }); // Sin alias aquí

Service.hasMany(ImeiOrder, { foreignKey: 'service_id' });
ImeiOrder.belongsTo(Service, { foreignKey: 'service_id' }); // Sin alias aquí

ImeiOrder.hasMany(Payment, { foreignKey: 'order_id' });
Payment.belongsTo(ImeiOrder, { foreignKey: 'order_id' }); // Sin alias aquí

module.exports = {
  User,
  Service,
  ImeiOrder,
  Payment,
};