require('dotenv').config({ path: './Backends/.env' });
const express = require('express');
const cors = require('cors');
const conectarDB = require('./Config/db'); // Tu archivo config/db.js con Sequelize


const Usuario = require('./Modelos/Usuarios');
const Cancha = require('./Modelos/Canchas');
const Reserva = require('./Modelos/Reservas');

// Un usuario puede tener muchas reservas / Una reserva pertenece a un usuario
Usuario.hasMany(Reserva, { foreignKey: 'UsuarioId' });
Reserva.belongsTo(Usuario, { foreignKey: 'UsuarioId' });

// Una cancha puede tener muchas reservas / Una reserva pertenece a una cancha
Cancha.hasMany(Reserva, { foreignKey: 'CanchaId' });
Reserva.belongsTo(Cancha, { foreignKey: 'CanchaId' });

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Conexión a la base de datos (MySQL con Sequelize)
conectarDB.authenticate()
    .then(() => {
        console.log('Conexión a la base de datos establecida correctamente.');
        
        // PUESTO EN FORCE: TRUE UNA SOLA VEZ PARA ARREGLAR LA TABLA CON EL MODELO VIEJO
        return conectarDB.sync({ force: true });
    })
    .then(() => {
        console.log('Modelos sincronizados con MySQL.');
    })
    .catch(err => {
        console.error('No se pudo conectar a la base de datos:', err);
    });


 app.use('/api/usuarios', require('./Rutas/UsuariosRutas'));
 app.use('/api/reservas', require('./Rutas/ReservasRutas'));
 app.use('/api/canchas', require('./Rutas/CanchasRutas'));

// Configuración del puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`El servidor está corriendo en el puerto ${PORT}`);
});