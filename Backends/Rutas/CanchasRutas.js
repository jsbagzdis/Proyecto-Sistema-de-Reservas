const express = require('express');
const router = express.Router();
const canchasControlador = require('../Controladores/CanchasControlador');

// Ruta para crear una cancha -> POST /api/canchas
router.post('/', canchasControlador.crearCancha);
// Ruta para obtener todas las canchas -> GET /api/canchas
router.get('/', canchasControlador.obtenerCanchas);

module.exports = router;