'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('api_keys', 'last_linked_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('api_keys', 'last_link_source', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('api_keys', 'last_link_source');
    await queryInterface.removeColumn('api_keys', 'last_linked_at');
  },
};
