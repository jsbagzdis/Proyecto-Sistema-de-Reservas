const express = require('express');
const router = express.Router();
const reservasControlador = require('../Controladores/ReservasControlador');

// api/reservas
router.get('/disponibles', reservasControlador.obtenerTurnosDisponibles);
router.post('/crear', reservasControlador.crearReserva);
router.get('/', reservasControlador.obtenerReservas);


module.exports = router;