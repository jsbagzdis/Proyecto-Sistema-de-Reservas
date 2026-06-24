const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db'); // Ajusta la ruta según tu estructura

const Deporte = sequelize.define('Deporte', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Evita duplicados como "Fútbol" y "futbol"
    }
});

module.exports = Deporte;