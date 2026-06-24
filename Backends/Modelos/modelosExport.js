// Backends/Modelos/modelosExport.js
const sequelize = require('../Config/db');
const { DataTypes } = require('sequelize');

const Turno = require('./Turnos')(sequelize, DataTypes);

module.exports = { Turno };