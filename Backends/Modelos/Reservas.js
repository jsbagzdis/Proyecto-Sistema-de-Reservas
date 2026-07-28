const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db'); // Asegurate de que la ruta a tu db.js sea correcta

const Reserva = sequelize.define('Reserva', {
  // En MySQL usamos enteros (INTEGER) para las llaves foráneas en lugar de ObjectIds
  deporte: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Fútbol', 'Tenis', 'Pádel', 'Básquetbol', "Basquetbol"]] // Equivalente al enum 
    }
  },
  fecha: {
    type: DataTypes.DATEONLY, // Formato "YYYY-MM-DD"
    allowNull: false
  },
  horario: {
    type: DataTypes.STRING, // Formato "HH:MM"
    allowNull: false
  },
  duracion: {
    type: DataTypes.INTEGER, // En MySQL especificamos mejor INTEGER para minutos/horas
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pendiente',
    validate: {
      isIn: [['pendiente', 'confirmada', 'cancelada']]
    }
  },
  UsuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Usuarios', key: 'id' }
  },
  CanchaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Canchas', key: 'id' }
  }
}, {
  timestamps: true,
  tableName: 'reservas'
});

module.exports = Reserva;