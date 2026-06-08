const Reserva = require('../Modelos/Reservas');
const Usuario = require('../Modelos/Usuarios');
const Cancha = require('../Modelos/Canchas');

// Crear una nueva reserva
exports.crearReserva = async (req, res) => {
    try {
        // 1. Agregamos deporte, duracion y estado a la lectura del body
        const { fecha, horario, UsuarioId, CanchaId, deporte, duracion, estado } = req.body;

        // Validar si la cancha ya está ocupada en ese día y horario
        const turnoOcupado = await Reserva.findOne({
            where: {
                fecha,
                horario,
                CanchaId
            }
        });

        if (turnoOcupado) {
            return res.status(400).json({ msg: 'Este turno ya se encuentra reservado.' });
        }

        // 2. Le pasamos todos los campos obligatorios a la base de datos
        const nuevaReserva = await Reserva.create({
            fecha,
            horario,
            UsuarioId, 
            CanchaId,
            deporte: deporte || 'futbol',     // Si no viene en el body, usa 'futbol'
            duracion: duracion || 60,         // Si no viene, toma 60 minutos
            estado: estado || 'pendiente'     // Si no viene, arranca en 'pendiente'
        });

        res.status(201).json({ msg: 'Reserva realizada con éxito', reserva: nuevaReserva });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al crear la reserva.' });
    }
};

// Obtener todas las reservas con la info de quién reserva y qué cancha
exports.obtenerReservas = async (req, res) => {
    try {
        const reservas = await Reserva.findAll({
            include: [
                { model: Usuario, attributes: ['id', 'nombre', 'apellido', 'usuario'] },
                { model: Cancha, attributes: ['id', 'nombre', 'deporte'] }
            ]
        });
        res.json(reservas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al obtener las reservas.' });
    }
};