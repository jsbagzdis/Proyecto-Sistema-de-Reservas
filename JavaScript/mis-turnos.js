document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = "http://localhost:3000/api/reservas";
    const usuarioString = localStorage.getItem("usuarioLogueado");

    if (!usuarioString) {
        alert("Debes iniciar sesión para ver tus turnos.");
        window.location.href = "login.html";
        return;
    }

    const usuario = JSON.parse(usuarioString);
    const USUARIO_ID = usuario.id;

    const cuerpoTabla = document.getElementById("cuerpo-tabla-turnos");
    const tablaTurnos = document.getElementById("tabla-turnos");
    const mensajeVacio = document.getElementById("mensaje-vacio");

    let reservas = [];

    const ESTADOS = {
        aceptada: { etiqueta: "Aceptada", clase: "badge-aceptada" },
        pendiente: { etiqueta: "Pendiente", clase: "badge-pendiente" },
        cancelada: { etiqueta: "Cancelada", clase: "badge-cancelada" },
        confirmada: { etiqueta: "Aceptada", clase: "badge-aceptada" }
    };

    function normalizarEstado(estado) {
        const clave = (estado || "").toLowerCase();
        return ESTADOS[clave] || ESTADOS.pendiente;
    }

    function obtenerTimestampReserva(reserva) {
        const horario = reserva.horario.length > 5 ? reserva.horario.substring(0, 5) : reserva.horario;
        return new Date(`${reserva.fecha}T${horario}:00`).getTime();
    }

    function ordenarReservasPorFecha(lista) {
        return [...lista].sort(
            (a, b) => obtenerTimestampReserva(b) - obtenerTimestampReserva(a)
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
        return clave === "pendiente" || clave === "aceptada" || clave === "confirmada";
    }

    async function cargarReservas() {
        try {
            const respuesta = await fetch(`${API_BASE}/usuario/${USUARIO_ID}`);
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
                    <td colspan="7" style="text-align:center; color:#b91c1c; padding: 24px;">
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
        if (!reserva || !puedeCancelar(reserva.estado)) return;

        const confirmar = confirm(
            `¿Confirmás la cancelación del turno en ${reserva.cancha} (${formatearFecha(reserva.fecha)} ${reserva.horario})?`
        );

        if (!confirmar) return;

        try {
            const respuesta = await fetch(`${API_BASE}/${idReserva}/cancelar`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ UsuarioId: USUARIO_ID })
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(resultado.msg || "No se pudo cancelar la reserva.");
            }

            reservas = reservas.map((r) =>
                r.id === idReserva ? { ...r, estado: "cancelada" } : r
            );

            renderizarTabla();
        } catch (error) {
            console.error("Error al cancelar:", error);
            alert(error.message || "Hubo un error al cancelar la reserva.");
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
            const horario = reserva.horario.length > 5 ? reserva.horario.substring(0, 5) : reserva.horario;
            const fila = document.createElement("tr");

            const celdaAcciones = puedeCancelar(reserva.estado)
                ? `<button type="button" class="btn-cancelar" data-id="${reserva.id}">Cancelar</button>`
                : `<span class="accion-no-disponible">—</span>`;

            fila.innerHTML = `
                <td>${reserva.cancha}</td>
                <td>${reserva.deporte}</td>
                <td>${formatearFecha(reserva.fecha)}</td>
                <td>${horario}</td>
                <td>${formatearDuracion(reserva.duracion)}</td>
                <td><span class="badge-estado ${estadoInfo.clase}">${estadoInfo.etiqueta}</span></td>
                <td>${celdaAcciones}</td>
            `;

            cuerpoTabla.appendChild(fila);
        });

        cuerpoTabla.querySelectorAll(".btn-cancelar").forEach((boton) => {
            boton.addEventListener("click", () => {
                cancelarReserva(Number(boton.dataset.id));
            });
        });
    }

    cargarReservas();
});
