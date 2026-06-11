document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. LÓGICA DE LA BARRA DE HAMBURGUESA
    // ==========================================
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    // 🔥 Bloqueamos las fechas anteriores a hoy en el calendario
    const fechaInput = document.getElementById("fecha");
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.setAttribute("min", hoy);

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    // ==========================================
    // 2. CONFIGURACIÓN E INICIALIZACIÓN DE BUSQUEDA
    // ==========================================
    const btnEnviar = document.getElementById("btnEnviar");
    const contenedorTurnos = document.getElementById("listaHorariosLibres");
    const mensaje = document.getElementById("mensaje");

    // Creamos dinámicamente el contenedor del cartel estético al final del body
    const overlay = document.createElement("div");
    overlay.className = "overlay-modal";
    const modal = document.createElement("div");
    modal.className = "modal-reserva";
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    const USUARIO_ID_LOGUEADO = 1; 

    if (!btnEnviar) {
        console.error("No se encontró el botón con ID 'btnEnviar' en el HTML.");
        return;
    }

    // ==========================================
    // 3. EVENTO PARA BUSCAR LOS TURNOS (GET)
    // ==========================================
    btnEnviar.addEventListener("click", async () => {
        const deporte = document.getElementById("deporteSelect").value;
        const fecha = document.getElementById("fecha").value;
        const duracion = document.getElementById("duracion").value;

        if (!deporte || !fecha || !duracion) {
            mensaje.textContent = "Por favor, completa todos los campos para buscar.";
            mensaje.style.color = "red";
            return;
        }

        mensaje.textContent = "Buscando turnos disponibles...";
        mensaje.style.color = "white";
        contenedorTurnos.innerHTML = ""; 

        try {
            const url = `http://localhost:3000/api/reservas/disponibles?deporte=${encodeURIComponent(deporte)}&fecha=${fecha}&duracion=${duracion}`;
            const respuesta = await fetch(url);
            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(datos.msg || "Error al buscar turnos.");
            }

            if (datos.length === 0) {
                contenedorTurnos.innerHTML = `<p style="color: white; text-align: center; padding: 20px;">No hay turnos disponibles para esta combinación.</p>`;
                mensaje.textContent = "";
                return;
            }

            mensaje.textContent = ""; 

            contenedorTurnos.dataset.fechaElegida = fecha;
            contenedorTurnos.dataset.duracionElegida = duracion;
            contenedorTurnos.dataset.deporteElegido = deporte;

            datos.forEach(turno => {
                const turnoCard = document.createElement("div");
                turnoCard.className = "turno-item";

                turnoCard.innerHTML = `
                    <div class="turno-info">
                        <span class="turno-hora">${turno.hora} hs</span>
                        <p class="turno-detalle">${turno.canchaNombre}</p>
                        <small style="color: #28a745; font-weight: bold;">Precio: $${turno.tarifaTotal}</small>
                    </div>
                    <button class="btnReservarItem" data-cancha="${turno.canchaId}" data-hora="${turno.hora}">
                        Reservar
                    </button>
                `;

                contenedorTurnos.appendChild(turnoCard);
            });

        } catch (error) {
            console.error("Error en la petición:", error);
            mensaje.textContent = error.message || "No se pudo conectar con el servidor.";
            mensaje.style.color = "red";
        }
    });

    // ==========================================
    // 4. EVENTO PARA CREAR LA RESERVA (POST) ESTÉTICO
    // ==========================================
    contenedorTurnos.addEventListener("click", async (e) => {
        if (e.target.classList.contains("btnReservarItem")) {
            const boton = e.target;
            
            const CanchaId = boton.dataset.cancha;
            const horario = boton.dataset.hora; 
            const fecha = contenedorTurnos.dataset.fechaElegida;
            const duracion = contenedorTurnos.dataset.duracionElegida;
            const deporte = contenedorTurnos.dataset.deporteElegido;

            boton.disabled = true;
            boton.textContent = "Procesando...";

            try {
                const respuesta = await fetch("http://localhost:3000/api/reservas/crear", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fecha,
                        horario,
                        UsuarioId: USUARIO_ID_LOGUEADO,
                        CanchaId,
                        deporte,
                        duracion: parseInt(duracion),
                        estado: "pendiente" // 🔥 Mandamos pendiente al backend
                    })
                });

                const resultado = await respuesta.json();

                if (!respuesta.ok) {
                    throw new Error(resultado.msg || "No se pudo concretar la reserva.");
                }

                // 🔥 RENDERIZAMOS EL MODAL CON DISEÑO DE ALTA CALIDAD
                const resData = resultado.reserva;
                modal.innerHTML = `
                    <h3>¡Solicitud Enviada!</h3>
                    <p style="margin-bottom: 15px;">Tu turno quedó registrado y está esperando la aprobación del complejo.</p>
                    <div class="modal-detalles">
                        📌 <strong>Cancha:</strong> ${resData.canchaNombre}<br>
                        ⚽ <strong>Deporte:</strong> ${resData.deporte}<br>
                        📅 <strong>Fecha:</strong> ${resData.fecha}<br>
                        ⏰ <strong>Horario:</strong> ${resData.horario.substring(0, 5)} hs<br>
                        🔄 <strong>Estado:</strong> <span class="badge-pendiente">${resData.estado.toUpperCase()}</span>
                    </div>
                    <button class="btn-cerrar-modal" id="btnCerrarModal">Entendido</button>
                `;

                // Activamos las clases CSS para que aparezcan con transición suave
                overlay.classList.add("mostrar");
                modal.classList.add("mostrar");

                // Configuración para cerrar el modal
                document.getElementById("btnCerrarModal").addEventListener("click", () => {
                    overlay.classList.remove("mostrar");
                    modal.classList.remove("mostrar");
                });

                // Sacamos la tarjeta de la lista del frontend
                boton.closest(".turno-item").remove();

            } catch (error) {
                console.error("Error al reservar:", error);
                alert(error.message || "Hubo un error al intentar reservar.");
                boton.disabled = false;
                boton.textContent = "Reservar";
            }
        }
    });
});