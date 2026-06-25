document.addEventListener("DOMContentLoaded", () => {
    
    const usuarioString = localStorage.getItem('usuarioLogueado'); 
    let USUARIO_ID_LOGUEADO = null;

    if (usuarioString) {
        const usuario = JSON.parse(usuarioString);
        USUARIO_ID_LOGUEADO = usuario.id;
        console.log("Datos del usuario:", usuario);

        if (usuario.rol === 'admin' || usuario.rol === 'administrador') {
            const navMisCanchas = document.getElementById('nav-mis-canchas');
            if (navMisCanchas) {
                navMisCanchas.style.display = 'inline-block'; 
            }
        }
    } else {
        alert("Debes iniciar sesión para reservar.");
        window.location.href = "login.html";
        return;
    }

    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");
    const fechaInput = document.getElementById("fecha");

    if (fechaInput) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaInput.setAttribute("min", hoy);
    }

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    const overlay = document.createElement("div");
    overlay.className = "overlay-modal";
    const modal = document.createElement("div");
    modal.className = "modal-reserva";
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    const btnEnviar = document.getElementById("btnEnviar");
    const contenedorTurnos = document.getElementById("listaHorariosLibres");
    const mensaje = document.getElementById("mensaje");

    // Lógica para buscar turnos disponibles
    if (btnEnviar) {
        btnEnviar.addEventListener("click", async () => {
            const deporte = document.getElementById("deporteSelect")?.value;
            const fecha = document.getElementById("fecha")?.value;
            const duracion = document.getElementById("duracion")?.value;

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
                    turnoCard.style.cssText = "background: white; border-radius: 8px; padding: 12px 15px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);";

                    const horaFormateada = turno.hora.length > 5 ? turno.hora.substring(0, 5) : turno.hora;

                    turnoCard.innerHTML = `
                        <div class="turno-info" style="border-left: 4px solid #ff8c00; padding-left: 12px; text-align: left;">
                            <div style="font-weight: bold; color: #333; font-size: 15px; margin-bottom: 4px;">
                                ${turno.canchaNombre} <span style="font-weight: normal; color: #777; font-size: 13px;">(${turno.canchaDeporte})</span>
                            </div>
                            <div style="color: #666; font-size: 13px;">
                                ${horaFormateada} hs | $${turno.tarifaTotal} | <span style="color: #555;">📍 ${turno.canchaUbicacion}</span>
                            </div>
                        </div>
                        <button class="btnReservarItem" data-cancha="${turno.canchaId}" data-hora="${turno.hora}" 
                                style="background-color: #28a745; color: white; border: none; border-radius: 6px; padding: 8px 16px; font-weight: bold; cursor: pointer; transition: background 0.2s;">
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
    }

    // Lógica delegada para el botón de "Reservar" dentro de cada tarjeta
    if (contenedorTurnos) {
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
                            estado: "pendiente" 
                        })
                    });

                    const resultado = await respuesta.json();

                    if (!respuesta.ok) {
                        throw new Error(resultado.msg || "No se pudo concretar la reserva.");
                    }

                    const resData = resultado.reserva;
                    modal.innerHTML = `
                        <h3>¡Solicitud Enviada!</h3>
                        <p style="margin-bottom: 15px;">Tu turno quedó registrado y está esperando la aprobación del complejo.</p>
                        <div class="modal-detalles">
                            📌 <strong>Cancha:</strong> ${resData.canchaNombre}<br>
                            📅 <strong>Fecha:</strong> ${resData.fecha}<br>
                            ⏰ <strong>Horario:</strong> ${resData.horario.substring(0, 5)} hs<br>
                            🔄 <strong>Estado:</strong> <span class="badge-pendiente">${resData.estado.toUpperCase()}</span>
                        </div>
                        <button class="btn-cerrar-modal" id="btnCerrarModal">Entendido</button>
                    `;

                    overlay.classList.add("mostrar");
                    modal.classList.add("mostrar");

                    document.getElementById("btnCerrarModal").addEventListener("click", () => {
                        overlay.classList.remove("mostrar");
                        modal.classList.remove("mostrar");
                    });

                    boton.closest(".turno-item").remove();

                } catch (error) {
                    console.error("Error al reservar:", error);
                    alert(error.message || "Hubo un error al intentar reservar.");
                    boton.disabled = false;
                    boton.textContent = "Reservar";
                }
            }
        });
    }
});