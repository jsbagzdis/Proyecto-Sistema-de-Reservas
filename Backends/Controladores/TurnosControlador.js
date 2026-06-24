const { where } = require('sequelize');
const { Turno } = require('../Modelos/modelosExport'); // Asegúrate de que tu índice de modelos exporte Turno

exports.obtenerTurnos = async (req, res) => {
    try{
        const { CanchaId } = req.query;
        const turnos = await Turno.findAll({ where: { CanchaId: CanchaId } });
        res.json(turnos);

        console.log("Buscando turnos para CanchaId", CanchaId);

    }catch (error) {
        console.error("Error en obtener turnos:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

exports.crearTurno = async (req, res) => {
    try {
        const { hora, precio, CanchaId } = req.body;

        console.log("Datos recibidos:", { hora, precio, CanchaId });

        const turnoExistente = await Turno.findOne({
            where: { hora: hora, CanchaId: CanchaId }
        });

        if (turnoExistente) {
            return res.status(400).json({ error: "Ya existe un turno en este horario para esta cancha."})
        }

        const nuevoTurno = await Turno.create({ hora, precio, CanchaId });
        res.status(201).json(nuevoTurno);
    } catch (error) {
        console.error("ERROR DETALLADO EN BD:", error);
        res.status(500).json({ error: "Error al crear el turno" });
    }
};

exports.eliminarTurno = async (req, res) => {
    try {
        await Turno.destroy({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) { res.status(500).json({ error: "Error al eliminar" }); }
};

exports.editarTurno = async (req, res) => {
    try {
        await Turno.update(req.body, { where: { id: req.params.id } });
        res.status(200).json({ msg: "Actualizado" });
    } catch (error) { res.status(500).json({ error: "Error al editar" }); }
};