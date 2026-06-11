const Reserva = require('../Modelos/Reservas');
const Usuario = require('../Modelos/Usuarios');
const Cancha = require('../Modelos/Canchas');
const conectarDB = require('../Config/db'); // Necesitamos la instancia para hacer la consulta cruda

// Crear una nueva reserva
exports.crearReserva = async (req, res) => {
    try {
        const { fecha, horario, UsuarioId, CanchaId, deporte, duracion, estado } = req.body;

        // 🔥 VALIDACIÓN DE FECHA: No permitir fechas pasadas
        const fechaElegida = new Date(fecha);
        const fechaHoy = new Date();
        fechaHoy.setHours(0, 0, 0, 0); // Ajustamos a medianoche para comparar solo la fecha

        if (fechaElegida < fechaHoy) {
            return res.status(400).json({ msg: 'No puedes realizar reservas en fechas pasadas.' });
        }

        // 🔥 NORMALIZAMOS LA HORA: Si viene "17:00", la convertimos en "17:00:00" para MySQL
        const horarioFormateado = horario.includes(':00') && horario.split(':').length === 2 
            ? `${horario}:00` 
            : horario;

        // Validar si la cancha ya está ocupada usando la hora formateada
        const turnoOcupado = await Reserva.findOne({
            where: {
                fecha,
                horario: horarioFormateado,
                CanchaId
            }
        });

        if (turnoOcupado) {
            return res.status(400).json({ msg: 'Este turno ya se encuentra reservado.' });
        }

        // Creamos el registro en la base de datos
        const nuevaReserva = await Reserva.create({
            fecha,
            horario: horarioFormateado, // 🔥 Guardamos con los segundos
            UsuarioId, 
            CanchaId,
            deporte,     
            duracion: parseInt(duracion), // Aseguramos que sea un número entero  
            estado: estado || 'pendiente'     
        });

        const canchaInfo = await Cancha.findByPk(CanchaId, { attributes: ['nombre'] });

        return res.status(201).json({ msg: 'Reserva realizada con éxito', reserva: {
            fecha: nuevaReserva.fecha,
            horario: nuevaReserva.horario,
            deporte: nuevaReserva.deporte,
            canchaNombre: canchaInfo ? canchaInfo.nombre : 'Cancha seleccionada',
            estado: nuevaReserva.estado
        } 
    });
    } catch (error) {
        console.error("Error  al crear reserva:", error);
        return res.status(500).json({ msg: 'Hubo un error al crear la reserva.'});
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

// 👇 NUEVA FUNCIÓN: Buscar turnos dinámicamente filtrando por deporte, fecha y duración 👇
exports.obtenerTurnosDisponibles = async (req, res) => {
    try {
        const { deporte, fecha, duracion } = req.query;

        // 1. Validación inicial
        if (!deporte || !fecha || !duracion) {
            return res.status(400).json({ msg: 'Faltan parámetros de búsqueda (deporte, fecha, duracion).' });
        }

        // 2. Consulta SQL pura para cruzar canchas y horarios fijos, descartando las que ya estén reservadas ese día a esa hora
        // Usamos REPLacements para blindar la query contra inyecciones SQL
        const query = `
            SELECT 
                c.id AS canchaId,
                c.nombre AS canchaNombre,
                c.tarifa AS tarifaBase,
                TIME_FORMAT(h.horaInicio, '%H:%i') AS hora
            FROM canchas c
            INNER JOIN horarios_canchas h ON c.id = h.canchaId
            WHERE c.deporte = :deporte
              AND NOT EXISTS (
                  SELECT 1 
                  FROM reservas r 
                  WHERE r.CanchaId = c.id 
                    AND r.fecha = :fecha 
                    AND TIME_FORMAT(r.horario, '%H:%i') = TIME_FORMAT(h.horaInicio, '%H:%i')
              )
            ORDER BY h.horaInicio ASC;
        `;

        const [resultados] = await conectarDB.query(query, {
            replacements: { deporte, fecha }
        });

        // 3. Calculamos la tarifa final basada en la duración que mandó el usuario en el formulario
        const turnosProcesados = resultados.map(turno => {
            const factorTiempo = parseInt(duracion) / 60; // 60 min = 1, 90 min = 1.5, 120 min = 2
            const tarifaTotal = Math.round(turno.tarifaBase * factorTiempo);

            return {
                canchaId: turno.canchaId,
                canchaNombre: turno.canchaNombre,
                hora: turno.hora,
                tarifaTotal
            };
        });

        res.json(turnosProcesados);

    } catch (error) {
        console.error('Error al obtener turnos disponibles:', error);
        res.status(500).json({ msg: 'Hubo un error al procesar los horarios disponibles.' });
    }
};