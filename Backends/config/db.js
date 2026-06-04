const { Sequelize } = require('node:sequelize');
require('node:dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false, // Para que no ensucie la consola con comandos SQL   
    }
);

module.exports = sequelize;