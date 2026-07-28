const { DataTypes } = require("sequelize");
const sequelize = require("../Config/db");
const Deporte = require("./Deportes");

const Cancha = sequelize.define(
  "Cancha",
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 50], // Nombre entre 3 y 50 caracteres
      },
    },
    ubicacion: { type: DataTypes.STRING },
    tarifa: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0, // No permitir tarifas negativas
      },
    },
    UsuarioId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Usuarios", key: "id" },
    },
    duracionTurno: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
      allowNull: false,
    },
  },
  { timestamps: true },
);

Cancha.belongsTo(Deporte, { foreignKey: "DeporteId" });
Deporte.hasMany(Cancha, { foreignKey: "DeporteId" });

module.exports = Cancha;
