const Usuario = require("../Modelos/Usuarios");

// Registrar un nuevo usuario
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, usuario, email, password, telefono, rol } =
      req.body;

    const existeUsuario = await Usuario.findOne({ where: { usuario } });
    const existeEmail = await Usuario.findOne({ where: { email } });

    if (existeUsuario || existeEmail) {
      return res
        .status(400)
        .json({ msg: "El nombre de usuario o el email ya están registrados." });
    }

    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      usuario,
      email,
      password,
      telefono,
      rol,
    });

    res
      .status(201)
      .json({
        msg: "Usuario registrado con éxito",
        usuarioId: nuevoUsuario.id,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error en el servidor." });
  }
};

// Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error al obtener los usuarios." });
  }
};

// Función para iniciar sesión (Login)
exports.loginUsuario = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    // 1. Buscar si el usuario existe en MySQL
    const usuarioEncontrado = await Usuario.findOne({ where: { usuario } });

    if (!usuarioEncontrado) {
      return res.status(400).json({ msg: "Usuario o contraseña incorrectos" });
    }

    // 2. Verificar la contraseña
    if (usuarioEncontrado.password !== password) {
      return res.status(400).json({ msg: "Usuario o contraseña incorrectos" });
    }

    // 3. CORRECCIÓN: Responder enviando todos los datos necesarios para el perfil
    res.json({
      msg: `¡Bienvenido, ${usuarioEncontrado.nombre}!`,
      usuario: {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        usuario: usuarioEncontrado.usuario,
        email: usuarioEncontrado.email,
        rol: usuarioEncontrado.rol
      }
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Hubo un error en el servidor al iniciar sesión." });
  }
};

// NUEVA FUNCIÓN: Recibe los datos modificados de la pantalla y actualiza MySQL
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id, nombre, usuario, email } = req.body;

    // Buscar el usuario por su Clave Primaria (ID)
    const usuarioEncontrado = await Usuario.findByPk(id);
    if (!usuarioEncontrado) {
      return res.status(404).json({ msg: "Usuario no encontrado." });
    }

    // Actualizar el registro usando Sequelize
    await usuarioEncontrado.update({
      nombre,
      usuario,
      email
    });

    res.json({
      msg: "Usuario actualizado correctamente",
      usuario: usuarioEncontrado,
    });
  } catch (error) {
    console.error(error);
    // Validar si intentan cambiar el nombre o correo por uno ya existente
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ msg: "El nombre de usuario o email ya está en uso." });
    }
    res
      .status(500)
      .json({ msg: "Hubo un error en el servidor al actualizar." });
  }
};
