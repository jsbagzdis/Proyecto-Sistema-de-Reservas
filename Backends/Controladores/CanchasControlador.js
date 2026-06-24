const Cancha = require('../Modelos/Canchas');

// 1. Crear una nueva cancha
exports.crearCancha = async (req, res) => {
    try {
        const nuevaCancha = await Cancha.create({
            nombre: req.body.nombre,
            ubicacion: req.body.ubicacion,
            tarifa: req.body.tarifa,
            duracionTurno: req.body.duracionTurno || 60, // Valor por defecto si no se proporciona
            DeporteId: req.body.DeporteId
        });

        // Validar que no exista otra cancha con el mismo nombre
        const canchaExiste = await Cancha.findOne({ where: { nombre: req.body.nombre } });
        if (canchaExiste) {
            return res.status(400).json({ msg: 'Ya existe una cancha con ese nombre.' });
        }
        res.status(201).json({ msg: 'Cancha creada con éxito', cancha: nuevaCancha });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al crear la cancha.' });
    }
};

// 2. Obtener todas las canchas
exports.obtenerCanchas = async (req, res) => {
    try {
        const canchas = await Cancha.findAll({include: 'Deporte' });
        res.json(canchas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al obtener las canchas.' });
    }
};