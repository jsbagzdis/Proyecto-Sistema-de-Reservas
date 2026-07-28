const Reserva = require("../Modelos/Reservas");
const Usuario = require("../Modelos/Usuarios");
const Cancha = require("../Modelos/Canchas");
const conectarDB = require("../Config/db"); // Necesitamos la instancia para hacer la consulta cruda

// Crear una nueva reserva
exports.crearReserva = async (req, res) => {
  try {
    const { fecha, horario, UsuarioId, CanchaId, deporte, duracion, estado } =
      req.body;

    const fechaElegida = new Date(fecha);
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0); // Ajustamos a medianoche para comparar solo la fecha

    if (fechaElegida < fechaHoy) {
      return res
        .status(400)
        .json({ msg: "No puedes realizar reservas en fechas pasadas." });
    }

    const horarioFormateado =
      horario.includes(":00") && horario.split(":").length === 2
        ? `${horario}:00`
        : horario;

    // Validar si la cancha ya está ocupada usando la hora formateada
    const turnoOcupado = await Reserva.findOne({
      where: {
        fecha,
        horario: horarioFormateado,
        CanchaId,
      },
    });

    if (turnoOcupado) {
      return res
        .status(400)
        .json({ msg: "Este turno ya se encuentra reservado." });
    }

    // Creamos el registro en la base de datos
    const nuevaReserva = await Reserva.create({
      fecha,
      horario: horarioFormateado,
      UsuarioId,
      CanchaId,
      deporte,
      duracion: parseInt(duracion), // Aseguramos que sea un número entero
      estado: estado || "pendiente",
    });

    const canchaInfo = await Cancha.findByPk(CanchaId, {
      attributes: ["nombre"],
    });

    return res.status(201).json({
      msg: "Reserva realizada con éxito",
      reserva: {
        fecha: nuevaReserva.fecha,
        horario: nuevaReserva.horario,
        deporte: nuevaReserva.deporte,
        canchaNombre: canchaInfo ? canchaInfo.nombre : "Cancha seleccionada",
        estado: nuevaReserva.estado,
      },
    });
  } catch (error) {
    console.error("Error  al crear reserva:", error);
    return res.status(500).json({ msg: "Hubo un error al crear la reserva." });
  }
};

// Obtener todas las reservas con la info de quién reserva y qué cancha
exports.obtenerReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        { model: Usuario, attributes: ["id", "nombre", "apellido", "usuario"] },
        { model: Cancha, attributes: ["id", "nombre", "ubicacion"] },
      ],
    });
    res.json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error al obtener las reservas." });
  }
};

exports.obtenerTurnosDisponibles = async (req, res) => {
  try {
    const { deporte, fecha, duracion } = req.query;

    if (!deporte || !fecha || !duracion) {
      return res.status(400).json({
        msg: "Faltan parámetros de búsqueda (deporte, fecha, duracion).",
      });
    }

    const query = `
            SELECT 
                c.id AS canchaId,
                c.nombre AS canchaNombre,
                c.ubicacion AS canchaUbicacion,
                d.nombre AS canchaDeporte,
                c.tarifa AS tarifaBase,
                TIME_FORMAT(t.hora, '%H:%i') AS hora
            FROM canchas c
            INNER JOIN turnos t ON c.id = t.canchaId
            INNER JOIN deportes d ON c.DeporteId = d.id
            WHERE d.nombre = :deporte
              AND NOT EXISTS (
                  SELECT 1 
                  FROM reservas r 
                  WHERE r.CanchaId = c.id 
                    AND r.fecha = :fecha 
                    AND TIME_FORMAT(r.horario, '%H:%i') = TIME_FORMAT(t.hora, '%H:%i')
              )
            ORDER BY t.hora ASC;
        `;

    const [resultados] = await conectarDB.query(query, {
      replacements: { deporte, fecha },
    });

    // 3. Calculamos la tarifa final basada en la duración que mandó el usuario en el formulario
    const turnosProcesados = resultados.map((turno) => {
      const factorTiempo = parseInt(duracion) / 60; // 60 min = 1, 90 min = 1.5, 120 min = 2
      const tarifaTotal = Math.round(turno.tarifaBase * factorTiempo);

      return {
        canchaId: turno.canchaId,
        canchaNombre: turno.canchaNombre,
        canchaUbicacion: turno.canchaUbicacion,
        canchaDeporte: turno.canchaDeporte,
        hora: turno.hora,
        tarifaTotal,
      };
    });

    res.json(turnosProcesados);
  } catch (error) {
    console.error("Error al obtener turnos disponibles:", error);
    res
      .status(500)
      .json({ msg: "Hubo un error al procesar los horarios disponibles." });
  }
};

// Obtener reservas de un usuario (vista "Mis Turnos")
exports.obtenerReservasPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    if (!usuarioId) {
      return res.status(400).json({ msg: "Debes indicar el ID del usuario." });
    }

    const reservas = await Reserva.findAll({
      where: { UsuarioId: usuarioId },
      include: [{ model: Cancha, attributes: ["id", "nombre", "ubicacion"] }],
      order: [
        ["fecha", "DESC"],
        ["horario", "DESC"],
      ],
    });

    const reservasFormateadas = reservas.map((reserva) => ({
      id: reserva.id,
      cancha: reserva.Cancha ? reserva.Cancha.nombre : "Cancha no disponible",
      ubicacion: reserva.Cancha ? reserva.Cancha.ubicacion : null,
      deporte: reserva.deporte,
      fecha: reserva.fecha,
      horario: reserva.horario ? reserva.horario.substring(0, 5) : "",
      duracion: reserva.duracion,
      estado: reserva.estado,
      UsuarioId: reserva.UsuarioId,
      CanchaId: reserva.CanchaId,
    }));

    res.json(reservasFormateadas);
  } catch (error) {
    console.error("Error al obtener reservas del usuario:", error);
    res.status(500).json({ msg: "Hubo un error al obtener tus turnos." });
  }
};

exports.obtenerReservasPorAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res
        .status(400)
        .json({ msg: "Debes indicar el ID del administrador." });
    }

    const adminUsuario = await Usuario.findByPk(adminId);
    if (
      !adminUsuario ||
      !["administrador", "admin"].includes(adminUsuario.rol)
    ) {
      return res.status(403).json({
        msg: "Acceso denegado. Solo administradores pueden ver estas reservas.",
      });
    }

    const reservas = await Reserva.findAll({
      include: [
        { model: Usuario, attributes: ["id", "nombre", "apellido", "usuario"] },
        { model: Cancha, attributes: ["id", "nombre", "ubicacion"] },
      ],
      order: [
        ["fecha", "DESC"],
        ["horario", "DESC"],
      ],
    });

    const reservasFormateadas = reservas.map((reserva) => ({
      id: reserva.id,
      cancha: reserva.Cancha ? reserva.Cancha.nombre : "Cancha no disponible",
      ubicacion: reserva.Cancha ? reserva.Cancha.ubicacion : null,
      deporte: reserva.deporte,
      fecha: reserva.fecha,
      horario: reserva.horario ? reserva.horario.substring(0, 5) : "",
      duracion: reserva.duracion,
      estado: reserva.estado,
      UsuarioId: reserva.UsuarioId,
      usuario: reserva.Usuario ? reserva.Usuario.usuario : "",
      nombreUsuario: reserva.Usuario ? reserva.Usuario.nombre : "",
      apellidoUsuario: reserva.Usuario ? reserva.Usuario.apellido : "",
    }));

    res.json(reservasFormateadas);
  } catch (error) {
    console.error("Error al obtener reservas del administrador:", error);
    res.status(500).json({
      msg: "Hubo un error al obtener las reservas del administrador.",
    });
  }
};

exports.actualizarEstadoReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, estado } = req.body;

    if (!adminId || !estado) {
      return res
        .status(400)
        .json({ msg: "Debes indicar el administrador y el estado deseado." });
    }

    const adminUsuario = await Usuario.findByPk(adminId);
    if (
      !adminUsuario ||
      !["administrador", "admin"].includes(adminUsuario.rol)
    ) {
      return res.status(403).json({
        msg: "Acceso denegado. Solo administradores pueden modificar el estado.",
      });
    }

    const reserva = await Reserva.findByPk(id);
    if (!reserva) {
      return res.status(404).json({ msg: "La reserva no existe." });
    }

    const estadoNormalizado = String(estado).toLowerCase();
    const estadosPermitidos = ["aceptada", "cancelada", "terminada"];
    if (!estadosPermitidos.includes(estadoNormalizado)) {
      return res.status(400).json({ msg: "Estado inválido." });
    }

    const estadoActual = String(reserva.estado).toLowerCase();
    if (
      estadoNormalizado === "aceptada" &&
      !["pendiente", "confirmada"].includes(estadoActual)
    ) {
      return res
        .status(400)
        .json({ msg: "Solo se puede aceptar una reserva pendiente." });
    }

    if (
      estadoNormalizado === "terminada" &&
      !["aceptada", "confirmada"].includes(estadoActual)
    ) {
      return res.status(400).json({
        msg: "Solo se puede marcar como terminada una reserva aceptada.",
      });
    }

    if (
      estadoNormalizado === "cancelada" &&
      ["cancelada", "terminada"].includes(estadoActual)
    ) {
      return res
        .status(400)
        .json({ msg: "No se puede cancelar una reserva ya cerrada." });
    }

    await reserva.update({ estado: estadoNormalizado });

    res.json({
      msg: "Estado actualizado correctamente.",
      reserva: { id: reserva.id, estado: reserva.estado },
    });
  } catch (error) {
    console.error("Error al actualizar estado de reserva:", error);
    res
      .status(500)
      .json({ msg: "Hubo un error al actualizar el estado de la reserva." });
  }
};

// Cancelar una reserva (solo el dueño y si no está ya cancelada)
exports.cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { UsuarioId, adminId } = req.body;

    if (!UsuarioId && !adminId) {
      return res.status(400).json({
        msg: "Debes indicar el usuario o el administrador que cancela la reserva.",
      });
    }

    const reserva = await Reserva.findByPk(id);

    if (!reserva) {
      return res.status(404).json({ msg: "La reserva no existe." });
    }

    if (adminId) {
      const adminUsuario = await Usuario.findByPk(adminId);
      if (
        !adminUsuario ||
        !["administrador", "admin"].includes(adminUsuario.rol)
      ) {
        return res
          .status(403)
          .json({ msg: "No tenés permiso para cancelar esta reserva." });
      }
    } else if (String(reserva.UsuarioId) !== String(UsuarioId)) {
      return res
        .status(403)
        .json({ msg: "No tenés permiso para cancelar esta reserva." });
    }

    if (reserva.estado === "cancelada") {
      return res.status(400).json({ msg: "Esta reserva ya fue cancelada." });
    }

    await reserva.update({ estado: "cancelada" });

    res.json({
      msg: "Reserva cancelada con éxito.",
      reserva: {
        id: reserva.id,
        estado: reserva.estado,
      },
    });
  } catch (error) {
    console.error("Error al cancelar reserva:", error);
    res.status(500).json({ msg: "Hubo un error al cancelar la reserva." });
  }
};
