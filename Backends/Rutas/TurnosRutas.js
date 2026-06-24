const express = require('express');
const router = express.Router();
const turnosControlador = require('../Controladores/TurnosControlador');

// Ruta para crear turno
router.post('/', turnosControlador.crearTurno);
router.get('/', turnosControlador.obtenerTurnos);
router.delete('/:id', turnosControlador.eliminarTurno);
router.put('/:id', turnosControlador.editarTurno);

module.exports = router;