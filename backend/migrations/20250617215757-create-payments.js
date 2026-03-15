'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      payment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      credited_amount: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      payment_method: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      payment_reference: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      stripe_payment_intent_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      stripe_checkout_session_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      balance_before: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      balance_after: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};
