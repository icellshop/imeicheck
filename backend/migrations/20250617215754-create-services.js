'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
      service_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      service_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      cost: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      object: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      limit: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      price_guest: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      price_registered: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      price_premium: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      price_pro: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('services');
  }
};
