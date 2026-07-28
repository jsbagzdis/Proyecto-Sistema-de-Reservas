require("dotenv").config({ path: "./Backends/.env" });
const express = require("express");
const cors = require("cors");
const conectarDB = require("./Config/db");
const sequelize = require("./Config/db");
const { DataTypes } = require("sequelize");

const Usuario = require("./Modelos/Usuarios");
const Reserva = require("./Modelos/Reservas");
const Deporte = require("./Modelos/Deportes");
const Cancha = require("./Modelos/Canchas");
const { Turno } = require("./Modelos/modelosExport");

Deporte.hasMany(Cancha, { foreignKey: "DeporteId" });
Cancha.belongsTo(Deporte, { foreignKey: "DeporteId" });

Usuario.hasMany(Cancha, { foreignKey: "UsuarioId" });
Cancha.belongsTo(Usuario, { foreignKey: "UsuarioId" });

// Un usuario puede tener muchas reservas / Una reserva pertenece a un usuario
Usuario.hasMany(Reserva, { foreignKey: "UsuarioId" });
Reserva.belongsTo(Usuario, { foreignKey: "UsuarioId" });

Cancha.hasMany(Turno, { foreignKey: "CanchaId" });
Turno.belongsTo(Cancha, { foreignKey: "CanchaId" });

// Una cancha puede tener muchas reservas / Una reserva pertenece a una cancha
Cancha.hasMany(Reserva, { foreignKey: "CanchaId" });
Reserva.belongsTo(Cancha, { foreignKey: "CanchaId" });

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Conexión a la base de datos (MySQL con Sequelize)
conectarDB
  .authenticate()
  .then(async () => {
    console.log("Conexión establecida.");

    await sequelize.sync();
    const [column] = await sequelize.query(
      "SHOW COLUMNS FROM Usuarios LIKE 'apellido';",
    );
    if (column.length === 0) {
      await sequelize.query(
        "ALTER TABLE Usuarios ADD COLUMN apellido VARCHAR(255) NULL;",
      );
      console.log("Columna apellido agregada a Usuarios.");
    }
    console.log(
      "Todas las tablas se sincronizaron correctamente (sin alteraciones automáticas).",
    );
  })
  .catch((err) => {
    console.error("Error al sincronizar:", err);
  });

app.use("/api/usuarios", require("./Rutas/UsuariosRutas"));
app.use("/api/reservas", require("./Rutas/ReservasRutas"));
app.use("/api/canchas", require("./Rutas/CanchasRutas"));
app.use("/api/deportes", require("./Rutas/DeportesRutas"));
app.use("/api/turnos", require("./Rutas/TurnosRutas"));

// Configuración del puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`El servidor está corriendo en el puerto ${PORT}`);
});
