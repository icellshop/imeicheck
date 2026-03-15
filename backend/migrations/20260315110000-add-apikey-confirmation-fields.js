'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('api_keys', 'confirmation_token', {
      type: Sequelize.STRING(128),
      allowNull: true,
    });

    await queryInterface.addColumn('api_keys', 'confirmation_issued_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('api_keys', 'confirmation_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex('api_keys', ['confirmation_token'], {
      name: 'api_keys_confirmation_token',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('api_keys', 'api_keys_confirmation_token');
    await queryInterface.removeColumn('api_keys', 'confirmation_expires_at');
    await queryInterface.removeColumn('api_keys', 'confirmation_issued_at');
    await queryInterface.removeColumn('api_keys', 'confirmation_token');
  },
};