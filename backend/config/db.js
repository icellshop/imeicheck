const { Sequelize } = require('sequelize');
require('dotenv').config();

const isSSL = process.env.DB_SSL === 'true';

let sequelize;

if (process.env.DATABASE_URL) {
  // Prioriza DATABASE_URL si existe
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: isSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      : {}
  });
} else {
  // Usa valores individuales si no hay DATABASE_URL
  sequelize = new Sequelize(
    process.env.DB_NAME || 'imeicheck',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: isSSL
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false
            }
          }
        : {}
    }
  );
}

module.exports = sequelize;