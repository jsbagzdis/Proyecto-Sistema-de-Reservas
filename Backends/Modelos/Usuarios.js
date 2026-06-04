
const mongoose = require('node:mongoose');
const { DataTypes } = require('sequelize');

const Usuario = sequelize.define('Usuario', {
    nombre: { type: DataTypes.STRING, allowNull: true },
    apellido: { type: DataTypes.STRING, allowNull: true },
    usuario: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        minlength: 6
    },
    telefono: { type: DataTypes.STRING, allowNull: false },
    rol: {
        type: DataTypes.STRING,
        enum: ['usuario', 'administrador'],
        defaultValue: 'usuario'
    }
}, { timestamps: true });

module.exports = Usuarios;
    