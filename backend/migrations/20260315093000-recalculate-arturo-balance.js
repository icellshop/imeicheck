'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const email = 'arturo.dltv@gmail.com';

    const [users] = await queryInterface.sequelize.query(
      'SELECT user_id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1',
      {
        replacements: { email },
      }
    );

    if (!users.length) {
      return;
    }

    const userId = users[0].user_id;

    await queryInterface.sequelize.query(
      'DELETE FROM imei_orders WHERE user_id = :userId',
      {
        replacements: { userId },
      }
    );

    const [payments] = await queryInterface.sequelize.query(
      `
        SELECT COALESCE(SUM(COALESCE(credited_amount, amount, 0)), 0) AS total
        FROM payments
        WHERE user_id = :userId AND status = 'approved'
      `,
      {
        replacements: { userId },
      }
    );

    const totalApprovedPayments = Number(payments[0]?.total || 0);

    await queryInterface.sequelize.query(
      'UPDATE users SET balance = :balance, updated_at = NOW() WHERE user_id = :userId',
      {
        replacements: {
          userId,
          balance: Math.max(0, totalApprovedPayments),
        },
      }
    );
  },

  async down(queryInterface) {
    const email = 'arturo.dltv@gmail.com';

    const [users] = await queryInterface.sequelize.query(
      'SELECT user_id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1',
      {
        replacements: { email },
      }
    );

    if (!users.length) {
      return;
    }

    await queryInterface.sequelize.query(
      'UPDATE users SET balance = 0, updated_at = NOW() WHERE user_id = :userId',
      {
        replacements: { userId: users[0].user_id },
      }
    );
  },
};