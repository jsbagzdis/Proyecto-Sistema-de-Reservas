const form = document.getElementById("registroForm");

form.addEventListener("submit", function(e) {
  e.preventDefault();

    const name = document.getElementById("nombre").value.trim();
    const user = document.getElementById("usuario").value.trim();
    const email = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("mensajeRegistro");



    // A. Validar campos vacíos
    if (!name || !email || !user || !password) {
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

    // 1. Traer lo que ya hay en LocalStorage
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // 2. Verificar si el nombre de usuario o email ya existe
    const existeUsuario = usuarios.some(u => u.usuario === user);
    const existeEmail = usuarios.some(u => u.email === email);
    if (existeUsuario) {
        msg.textContent = "El nombre de usuario ya esta en uso.";
        msg.className = "error";
        return;
    }
    if (existeEmail) {
        msg.textContent = "El email ya está registrado.";
        msg.className = "error";
        return;
    }

    // 3. Crear el nuevo objeto usuario y agregarlo 
    const nuevoUsuario = {
        nombre: name,
        usuario: user,
        email: email,
        password: password
    };
    usuarios.push(nuevoUsuario);

    // 4. Guardar en LocalStorage
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    msg.textContent = "Registro exitoso. Ahora puedes iniciar sesión.";
    msg.className = "correcto";

    
setTimeout(() => {  
    window.location.href = "../Login/login.html";
}, 1500);
});

function irALogin() {
    window.location.href = "../Login/login.html";
}

