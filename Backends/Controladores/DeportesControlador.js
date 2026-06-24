const Deporte = require('../Modelos/Deportes');

exports.obtenerDeportes = async (req, res) => {
    const deportes = await Deporte.findAll();
    res.json(deportes);
};

exports.crearDeporte = async (req, res) => {
    try {
        const nuevoDeporte = await Deporte.create(req.body);
        res.status(201).json(nuevoDeporte);
    } catch (error) {
        res.status(400).json({ error: 'El deporte ya existe o hubo un error' });
    }
};