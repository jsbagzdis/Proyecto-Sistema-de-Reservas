
    document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registroForm");

    form.addEventListener("submit", async function(e) { // Agregamos async
        e.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const usuario = document.getElementById("usuario").value.trim();
        const email = document.getElementById("correo").value.trim();
        const password = document.getElementById("password").value.trim();
        
        const msg = document.getElementById("mensajeRegistro");

        // Validaciones básicas de JS (se mantienen igual)
        if (!nombre || !email || !usuario || !password) {
            msg.textContent = "Todos los campos son obligatorios";
            msg.className = "error";
            return;
        }

        // B. Validar formato de Email (usando una expresión regular básica)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            msg.textContent = "El formato de email no es válido";
            msg.className = "error";
            return;
        }

        // C. Validar largo de contraseña
        if (password.length < 6) {
            msg.textContent = "La contraseña debe tener al menos 6 caracteres";
            msg.className = "error";
            return;
        }

        try {
            // En lugar de localStorage, enviamos los datos al servidor
            const respuesta = await fetch("http://localhost:3000/api/usuarios/registrar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre,
                    usuario,
                    email,
                    password,
                    rol: 'usuario' // Por defecto
                })
            });

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                msg.textContent = "Registro exitoso. Redirigiendo...";
                msg.className = "correcto";
                setTimeout(() => {
                    window.location.href = "../Html/login.html";
                }, 1500);
            } else {
                // Aquí mostramos el error que viene del backend (ej: "Email ya registrado")
                msg.textContent = resultado.msg;
                msg.className = "error";
            }
        } catch (error) {
            console.error("Error al registrar:", error);
            msg.textContent = "Error de conexión con el servidor.";
            msg.className = "error";
        }
    });

});

function irALogin() {
    window.location.href = "../Html/login.html";
}

