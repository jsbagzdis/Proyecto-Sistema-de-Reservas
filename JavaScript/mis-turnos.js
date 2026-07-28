document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:3000/api/reservas";
  const usuarioString = localStorage.getItem("usuarioLogueado");

  if (!usuarioString) {
    crearNotificacion("Debes iniciar sesión para ver tus turnos.", "warning");
    window.location.href = "login.html";
    return;
  }

  const usuario = JSON.parse(usuarioString);
  const USUARIO_ID = usuario.id;
  const esAdmin = usuario.rol === "admin" || usuario.rol === "administrador";

  const cuerpoTabla = document.getElementById("cuerpo-tabla-turnos");
  const tablaTurnos = document.getElementById("tabla-turnos");
  const mensajeVacio = document.getElementById("mensaje-vacio");

  let reservas = [];

  const ESTADOS = {
    aceptada: { etiqueta: "Aceptada", clase: "badge-aceptada" },
    pendiente: { etiqueta: "Pendiente", clase: "badge-pendiente" },
    cancelada: { etiqueta: "Cancelada", clase: "badge-cancelada" },
    confirmada: { etiqueta: "Aceptada", clase: "badge-aceptada" },
    terminada: { etiqueta: "Terminada", clase: "badge-terminada" },
  };

  function normalizarEstado(estado) {
    const clave = (estado || "").toLowerCase();
    return ESTADOS[clave] || ESTADOS.pendiente;
  }

  function obtenerTimestampReserva(reserva) {
    const horario =
      reserva.horario.length > 5
        ? reserva.horario.substring(0, 5)
        : reserva.horario;
    return new Date(`${reserva.fecha}T${horario}:00`).getTime();
  }

  function ordenarReservasPorFecha(lista) {
    return [...lista].sort(
      (a, b) => obtenerTimestampReserva(b) - obtenerTimestampReserva(a),
    );
  }

  function formatearFecha(fechaISO) {
    const [anio, mes, dia] = fechaISO.split("-");
    return `${dia}/${mes}/${anio}`;
  }

  function formatearDuracion(minutos) {
    if (minutos >= 60 && minutos % 60 === 0) {
      const horas = minutos / 60;
      return horas === 1 ? "1 hora" : `${horas} horas`;
    }
    return `${minutos} min`;
  }

  function puedeCancelar(estado) {
    const clave = (estado || "").toLowerCase();
    return (
      clave === "pendiente" || clave === "aceptada" || clave === "confirmada"
    );
  }

  function reservaPasada(reserva) {
    const horario =
      reserva.horario.length > 5
        ? reserva.horario.substring(0, 5)
        : reserva.horario;
    const fechaHoraReserva = new Date(`${reserva.fecha}T${horario}:00`);
    return fechaHoraReserva.getTime() <= Date.now();
  }

  async function cargarReservas() {
    try {
      const endpoint = esAdmin
        ? `${API_BASE}/admin/${USUARIO_ID}`
        : `${API_BASE}/usuario/${USUARIO_ID}`;
      const respuesta = await fetch(endpoint);
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.msg || "No se pudieron cargar tus turnos.");
      }

      reservas = datos;
      renderizarTabla();
    } catch (error) {
      console.error("Error al cargar reservas:", error);
      cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; color:#b91c1c; padding: 24px;">
                        ${error.message || "Error de conexión con el servidor."}
                    </td>
                </tr>
            `;
      tablaTurnos.classList.remove("hidden");
      mensajeVacio.classList.add("hidden");
    }
  }

  async function cancelarReserva(idReserva) {
    const reserva = reservas.find((r) => r.id === idReserva);
    if (!reserva || !puedeCancelar(reserva.estado) || reservaPasada(reserva))
      return;

    const confirmar = esAdmin
      ? true
      : await confirmarAccion(
          `¿Confirmás la cancelación del turno en ${reserva.cancha} (${formatearFecha(reserva.fecha)} ${reserva.horario})?`,
        );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API_BASE}/${idReserva}/cancelar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UsuarioId: esAdmin ? undefined : USUARIO_ID,
          adminId: esAdmin ? USUARIO_ID : undefined,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.msg || "No se pudo cancelar la reserva.");
      }

      reservas = reservas.map((r) =>
        r.id === idReserva ? { ...r, estado: "cancelada" } : r,
      );

      renderizarTabla();
      crearNotificacion("Reserva cancelada correctamente.", "success");
    } catch (error) {
      console.error("Error al cancelar:", error);
      crearNotificacion(
        error.message || "Hubo un error al cancelar la reserva.",
        "error",
      );
    }
  }

  async function actualizarEstadoReserva(idReserva, nuevoEstado) {
    const reserva = reservas.find((r) => r.id === idReserva);
    if (!reserva) return;

    const confirmar = esAdmin
      ? true
      : await confirmarAccion(
          `¿Confirmás cambiar el estado de la reserva de ${reserva.cancha} a ${nuevoEstado.toUpperCase()}?`,
        );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API_BASE}/${idReserva}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: USUARIO_ID, estado: nuevoEstado }),
      });

      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        throw new Error(resultado.msg || "No se pudo actualizar el estado.");
      }

      reservas = reservas.map((r) =>
        r.id === idReserva ? { ...r, estado: nuevoEstado } : r,
      );

      renderizarTabla();
      crearNotificacion("Estado actualizado correctamente.", "success");
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      crearNotificacion(
        error.message || "Hubo un error al actualizar el estado.",
        "error",
      );
    }
  }

  function renderizarTabla() {
    const reservasOrdenadas = ordenarReservasPorFecha(reservas);

    cuerpoTabla.innerHTML = "";

    if (reservasOrdenadas.length === 0) {
      tablaTurnos.classList.add("hidden");
      mensajeVacio.classList.remove("hidden");
      return;
    }

    tablaTurnos.classList.remove("hidden");
    mensajeVacio.classList.add("hidden");

    reservasOrdenadas.forEach((reserva) => {
      const estadoInfo = normalizarEstado(reserva.estado);
      const horario =
        reserva.horario.length > 5
          ? reserva.horario.substring(0, 5)
          : reserva.horario;
      const fila = document.createElement("tr");

      const usuarioReserva = reserva.usuario
        ? `${reserva.nombreUsuario || ""} ${reserva.apellidoUsuario || ""}`.trim() ||
          reserva.usuario
        : esAdmin
          ? "Desconocido"
          : usuario.usuario;

      let celdaAcciones = `<span class="accion-no-disponible">—</span>`;

      if (esAdmin) {
        const acciones = [];
        if (
          reserva.estado.toLowerCase() === "pendiente" ||
          reserva.estado.toLowerCase() === "confirmada"
        ) {
          acciones.push(
            `<button type="button" class="btn-accion btn-aceptar" data-id="${reserva.id}" data-estado="aceptada">Aceptar</button>`,
          );
          acciones.push(
            `<button type="button" class="btn-accion btn-cancelar" data-id="${reserva.id}" data-estado="cancelada">Cancelar</button>`,
          );
        } else if (reserva.estado.toLowerCase() === "aceptada") {
          acciones.push(
            `<button type="button" class="btn-accion btn-terminada" data-id="${reserva.id}" data-estado="terminada">Terminar</button>`,
          );
          acciones.push(
            `<button type="button" class="btn-accion btn-cancelar" data-id="${reserva.id}" data-estado="cancelada">Cancelar</button>`,
          );
        }
        celdaAcciones =
          acciones.length > 0 ? acciones.join(" ") : celdaAcciones;
      } else {
        if (puedeCancelar(reserva.estado) && !reservaPasada(reserva)) {
          celdaAcciones = `<button type="button" class="btn-cancelar" data-id="${reserva.id}" data-estado="cancelada">Cancelar</button>`;
        }
      }

      fila.innerHTML = `
                <td>${reserva.cancha}</td>
                <td>${usuarioReserva}</td>
                <td>${reserva.deporte}</td>
                <td>${formatearFecha(reserva.fecha)}</td>
                <td>${horario}</td>
                <td>${formatearDuracion(reserva.duracion)}</td>
                <td><span class="badge-estado ${estadoInfo.clase}">${estadoInfo.etiqueta}</span></td>
                <td>${celdaAcciones}</td>
            `;

      cuerpoTabla.appendChild(fila);
    });

    cuerpoTabla
      .querySelectorAll(".btn-cancelar, .btn-aceptar, .btn-terminada")
      .forEach((boton) => {
        boton.addEventListener("click", async () => {
          const id = Number(boton.dataset.id);
          const nuevoEstado = boton.dataset.estado;
          if (nuevoEstado === "cancelada") {
            await cancelarReserva(id);
          } else {
            await actualizarEstadoReserva(id, nuevoEstado);
          }
        });
      });
  }

  cargarReservas();

  if (esAdmin) {
    setInterval(cargarReservas, 12000);
  }
});
