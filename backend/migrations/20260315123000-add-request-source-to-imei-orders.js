'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('imei_orders', 'request_source', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'imeicheck2',
    });

    await queryInterface.sequelize.query(
      "UPDATE imei_orders SET request_source = 'imeicheck2' WHERE request_source IS NULL"
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('imei_orders', 'request_source');
  },
};