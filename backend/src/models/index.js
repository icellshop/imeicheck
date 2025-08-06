const User = require('./user');
const Service = require('./service');
const ImeiOrder = require('./imei_order');
const Payment = require('./payment');

// Asociaciones principales
User.hasMany(ImeiOrder, { foreignKey: 'user_id' });
ImeiOrder.belongsTo(User, { foreignKey: 'user_id', as: 'User' }); // <--- usa el alias

User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });

Service.hasMany(ImeiOrder, { foreignKey: 'service_id' });
ImeiOrder.belongsTo(Service, { foreignKey: 'service_id' });

ImeiOrder.hasMany(Payment, { foreignKey: 'order_id' });
Payment.belongsTo(ImeiOrder, { foreignKey: 'order_id' });

module.exports = {
  User,
  Service,
  ImeiOrder,
  Payment,
};