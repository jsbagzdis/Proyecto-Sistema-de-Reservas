const express = require('express');
const router = express.Router();
const reservasControlador = require('../Controladores/ReservasControlador');

// api/reservas
router.get('/disponibles', reservasControlador.obtenerTurnosDisponibles);
router.get('/usuario/:usuarioId', reservasControlador.obtenerReservasPorUsuario);
router.put('/:id/cancelar', reservasControlador.cancelarReserva);
router.post('/crear', reservasControlador.crearReserva);
router.get('/', reservasControlador.obtenerReservas);


module.exports = router;