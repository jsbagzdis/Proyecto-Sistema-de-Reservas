const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Cancha = sequelize.define('Cancha', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  deporte: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isIn: [['futbol', 'tenis', 'padel', 'basquetbol']] }
  },
  tarifa: { type: DataTypes.FLOAT, allowNull: false },
  duracionTurno: { type: DataTypes.INTEGER, defaultValue: 60, allowNull: false }
}, { timestamps: true });

module.exports = Cancha;