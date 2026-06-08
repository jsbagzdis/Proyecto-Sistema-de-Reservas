const Usuario = require('../Modelos/Usuarios');

// Registrar un nuevo usuario
exports.registrarUsuario = async (req, res) => {
    try {
        const { nombre, apellido, usuario, email, password, telefono, rol } = req.body;

        // Verificar si el usuario o email ya existen
        const existeUsuario = await Usuario.findOne({ where: { usuario } });
        const existeEmail = await Usuario.findOne({ where: { email } });

        if (existeUsuario || existeEmail) {
            return res.status(400).json({ msg: 'El nombre de usuario o el email ya están registrados.' });
        }

        // Crear el usuario en MySQL
        const nuevoUsuario = await Usuario.create({
            nombre,
            apellido,
            usuario,
            email,
            password, // Nota: Idealmente usar bcryptjs para encriptarla más adelante
            telefono,
            rol
        });

        res.status(201).json({ msg: 'Usuario registrado con éxito', usuarioId: nuevoUsuario.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error en el servidor.' });
    }
};

// Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['password'] } // Seguridad: no enviamos la contraseña de vuelta
        });
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al obtener los usuarios.' });
    }
};

// Función para iniciar sesión (Login)
exports.loginUsuario = async (req, res) => {
    try {
        const { usuario, password } = req.body;

        // 1. Buscar si el usuario existe en MySQL
        const usuarioEncontrado = await Usuario.findOne({ where: { usuario } });

        if (!usuarioEncontrado) {
            return res.status(400).json({ msg: 'Usuario o contraseña incorrectos' });
        }

        // 2. Verificar la contraseña (por ahora texto plano, luego le metemos bcrypt)
        if (usuarioEncontrado.password !== password) {
            return res.status(400).json({ msg: 'Usuario o contraseña incorrectos' });
        }

        // 3. Si todo está bien, responder con los datos del usuario
        res.json({
            msg: `¡Bienvenido, ${usuarioEncontrado.nombre}!`,
            usuario: {
                id: usuarioEncontrado.id,
                nombre: usuarioEncontrado.nombre,
                apellido: usuarioEncontrado.apellido,
                usuario: usuarioEncontrado.usuario
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al iniciar sesión.' });
    }
};
