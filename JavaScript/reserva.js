document.addEventListener("DOMContentLoaded", async () => {
    const canchaSelect = document.getElementById("canchaSelect");
    const btnEnviar = document.getElementById("btnEnviar");
    const msg = document.getElementById("mensaje");

    // 1. CONTROL DE ACCESO: Validar login
    const usuarioLogueado = JSON.parse(sessionStorage.getItem("usuarioLogueado"));
    if (!usuarioLogueado) {
        alert("Por favor, inicia sesión primero.");
        window.location.href = "../Html/login.html";
        return;
    }

    // 2. CARGAR LAS CANCHAS: Rellenar el select apenas abre la página
    try {
        const respuesta = await fetch("http://localhost:3000/api/canchas");
        const canchas = await respuesta.json();

        if (respuesta.ok) {
            canchaSelect.innerHTML = '<option value="" disabled selected>Seleccione una cancha...</option>';
            canchas.forEach(cancha => {
                const option = document.createElement("option");
                option.value = cancha.id; // ID de MySQL (1, 2, etc.)
                option.textContent = `${cancha.nombre} (${cancha.deporte.toUpperCase()}) - $${cancha.tarifa}`;
                canchaSelect.appendChild(option);
            });
        } else {
            canchaSelect.innerHTML = '<option value="">Error al cargar las canchas</option>';
        }
    } catch (error) {
        console.error("Error al conectar con el backend:", error);
        canchaSelect.innerHTML = '<option value="">No se pudo conectar con el servidor</option>';
    }

    // 3. ENVIAR RESERVA: Crear el registro en MySQL al hacer clic en ENVIAR
    btnEnviar.addEventListener("click", async (e) => {
        e.preventDefault();
        
        // Limpiar estilos de error previos si los usás
        document.querySelectorAll('input, select').forEach(el => el.classList.remove('input-error'));
        msg.textContent = "";
        msg.className = "";

        const canchaId = canchaSelect.value;
        const fecha = document.getElementById("fecha").value;
        const horario = document.getElementById("horario").value;
        const duracion = document.getElementById("duracion").value;

        // Validaciones de campos vacíos
        if (!canchaId) {
            canchaSelect.classList.add("input-error");
            msg.textContent = "Falta seleccionar la cancha.";
            msg.className = "msj-rojo";
            return;
        }
        if (!fecha) {
            document.getElementById("fecha").classList.add("input-error");
            msg.textContent = "Falta elegir una fecha.";
            msg.className = "msj-rojo";
            return;
        }
        if (!horario) {
            document.getElementById("horario").classList.add("input-error");
            msg.textContent = "Falta elegir un horario.";
            msg.className = "msj-rojo";
            return;
        }
        if (!duracion) {
            document.getElementById("duracion").classList.add("input-error");
            msg.textContent = "Falta elegir la duración.";
            msg.className = "msj-rojo";
            return;
        }

        // Validación de fecha pasada
        const ahora = new Date();
        const reservaTime = new Date(fecha + "T" + horario);
        if (reservaTime < ahora) {
            document.getElementById("fecha").classList.add("input-error");
            document.getElementById("horario").classList.add("input-error");
            msg.textContent = "Error: La fecha o el horario ya pasaron.";
            msg.className = "msj-rojo";
            return;
        }

        // Convertir la duración de la interfaz a minutos para MySQL
        let duracionEnMinutos = 60;
        if (duracion === "1.5") duracionEnMinutos = 90;
        if (duracion === "2") duracionEnMinutos = 120;

        // Enviar datos al Backend
        try {
            const respuestaReserva = await fetch("http://localhost:3000/api/reservas/crear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fecha: fecha,
                    horario: horario,
                    deporte: "futbol", // Pone un valor base o podés quitarlo si tu backend ya hereda del CanchaId
                    duracion: duracionEnMinutos,
                    UsuarioId: usuarioLogueado.id,
                    CanchaId: parseInt(canchaId)
                })
            });

            const datos = await respuestaReserva.json();

            if (respuestaReserva.ok) {
                msg.textContent = "¡Reserva realizada con éxito en la base de datos!";
                msg.className = "msj-verde";
                document.getElementById("formularioForm").reset();
            } else {
                msg.textContent = datos.msg || "No se pudo completar la reserva.";
                msg.className = "msj-rojo";
            }
        } catch (error) {
            console.error("Error al crear reserva:", error);
            msg.textContent = "Error de conexión al procesar la reserva.";
            msg.className = "msj-rojo";
        }
    });
});