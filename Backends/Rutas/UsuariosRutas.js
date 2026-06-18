const express = require('express');
const router = express.Router();
const usuariosControlador = require('../Controladores/UsuariosControlador');

// api/usuarios

// Registrar un nuevo usuario en la base de datos
router.post('/registrar', usuariosControlador.registrarUsuario);

// Iniciar sesión (Login) y traer los datos a la sesión
router.post('/login', usuariosControlador.loginUsuario);

// Obtener la lista de todos los usuarios
router.get('/', usuariosControlador.obtenerUsuarios);

// NUEVA RUTA: Modificar y actualizar los datos del usuario logueado en MySQL
router.put('/actualizar', usuariosControlador.actualizarUsuario);

module.exports = router;