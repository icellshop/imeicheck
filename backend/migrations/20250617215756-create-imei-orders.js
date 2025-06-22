'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('imei_orders', {
      order_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      imei: {
        type: Sequelize.STRING,
        allowNull: false
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'services',
          key: 'service_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending'
      },
      result: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      guest_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      price_used: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      user_type_at_order: {
        type: Sequelize.STRING,
        allowNull: true
      },
      service_name_at_order: {
        type: Sequelize.STRING,
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      payment_intent_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      balance_before: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      balance_after: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('imei_orders');
  }
};