const express = require('express');
const router = express.Router();
const usuariosControlador = require('../Controladores/UsuariosControlador');

// api/usuarios
router.post('/registrar', usuariosControlador.registrarUsuario);
router.post('/login', usuariosControlador.loginUsuario);
router.get('/', usuariosControlador.obtenerUsuarios);

module.exports = router;