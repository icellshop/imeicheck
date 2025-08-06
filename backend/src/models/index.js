const User = require('./user');
const Service = require('./service');
const ImeiOrder = require('./imei_order');
const Payment = require('./payment');

// Todas las asociaciones van aquí:

User.hasMany(ImeiOrder, { foreignKey: 'user_id' });
ImeiOrder.belongsTo(User, { foreignKey: 'user_id', as: 'User' }); // Usamos alias 'User'

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