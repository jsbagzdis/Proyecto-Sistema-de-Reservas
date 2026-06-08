const Cancha = require('../Modelos/Canchas');

// 1. Crear una nueva cancha
exports.crearCancha = async (req, res) => {
    try {
        const { nombre, deporte, tarifa, duracionTurno } = req.body;

        // Validar que no exista otra cancha con el mismo nombre
        const canchaExiste = await Cancha.findOne({ where: { nombre } });
        if (canchaExiste) {
            return res.status(400).json({ msg: 'Ya existe una cancha con ese nombre.' });
        }

        // Crear la cancha en MySQL
        const nuevaCancha = await Cancha.create({
            nombre,
            deporte,
            tarifa,
            duracionTurno: duracionTurno || 60 // Por defecto 60 minutos si no viene
        });

        res.status(201).json({ msg: 'Cancha creada con éxito', cancha: nuevaCancha });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al crear la cancha.' });
    }
};

// 2. Obtener todas las canchas
exports.obtenerCanchas = async (req, res) => {
    try {
        const canchas = await Cancha.findAll();
        res.json(canchas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al obtener las canchas.' });
    }
};