const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');
const Deporte = require('./Deportes');

const Cancha = sequelize.define('Cancha', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  ubicacion: { type: DataTypes.STRING},
  tarifa: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  duracionTurno: { type: DataTypes.INTEGER, defaultValue: 60, allowNull: false }
}, { timestamps: true });

Cancha.belongsTo(Deporte, { foreignKey: 'DeporteId' });
Deporte.hasMany(Cancha, { foreignKey: 'DeporteId' });

module.exports = Cancha;