'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('api_keys', {
      key_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      api_key: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'active',
        comment: 'active | revoked',
      },
      label: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Optional name/label set by user',
      },
      last_used_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      revoked_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      revoked_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'user_id that triggered the revoke (user self or admin)',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('api_keys', ['api_key'], { unique: true, name: 'api_keys_api_key_unique' });
    await queryInterface.addIndex('api_keys', ['user_id', 'status'], { name: 'api_keys_user_status' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('api_keys');
  },
};
