const express = require('express');
const router = express.Router();
const deporteControlador = require('../Controladores/DeportesControlador');

router.get('/', deporteControlador.obtenerDeportes);
router.post('/', deporteControlador.crearDeporte);

module.exports = router;