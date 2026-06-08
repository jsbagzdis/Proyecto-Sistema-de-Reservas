const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db'); // Importamos tu conexión real a MySQL

const Usuario = sequelize.define('Usuario', {
  nombre: { type: DataTypes.STRING, allowNull: true },
  apellido: { type: DataTypes.STRING, allowNull: true },
  usuario: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [6, 100] } // En Sequelize se usa validate para el largo mínimo
  },
  telefono: { type: DataTypes.STRING, allowNull: false },
  rol: {
    type: DataTypes.STRING,
    validate: { isIn: [['usuario', 'administrador']] }, // Equivalente a enum en Sequelize
    defaultValue: 'usuario'
  }
}, { timestamps: true });

module.exports = Usuario;
    