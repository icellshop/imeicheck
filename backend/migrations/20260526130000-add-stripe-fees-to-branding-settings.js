'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('branding_settings', 'stripe_fee_percent', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 3.6,
    });

    await queryInterface.addColumn('branding_settings', 'stripe_fee_fixed', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.30,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('branding_settings', 'stripe_fee_fixed');
    await queryInterface.removeColumn('branding_settings', 'stripe_fee_percent');
  },
};
