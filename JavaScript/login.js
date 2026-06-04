const form = document.getElementById("loginForm");// Capturamos el formulario para agregarle el evento de submit

form.addEventListener("submit", function(e) {
  e.preventDefault();// Evitamos que el formulario se envíe y recargue la página

  // Capturamos los valores ingresados por el usuario

  const userIngresado = document.getElementById("usuario").value.trim();
  const passIngresada = document.getElementById("password").value.trim();
  const msg = document.getElementById("mensaje");

  // 1. Obtener los usuarios de localStorage (o un array vacío si no hay ninguno)
   
  const usuariosRegistrados = JSON.parse(localStorage.getItem("usuarios")) || [];


  // 2. Validar campos vacíos
  if (!userIngresado || !passIngresada) {
    msg.textContent = "Completa todos los campos";
    msg.className = "error";
    return;
  }

  // 3. Buscar el usuario en la lista
  const usuarioEncontrado = usuariosRegistrados.find(u => u.usuario === userIngresado && u.password === passIngresada);

  // 4. Si se encuentra el usuario, mostrar mensaje de bienvenida
  if (usuarioEncontrado) {
    msg.textContent = `Bienvenido, ${usuarioEncontrado.nombre}!`;
    msg.className = "correcto";

  // Guardamos quién entró para usarlo en el menú
  sessionStorage.setItem("usuarioLogueado", JSON.stringify(usuarioEncontrado));

setTimeout(() => {
      window.location.href = "../Reserva/reserva.html";
    }, 1000);
  } else{
    msg.textContent = "Usuario o contraseña incorrectos";
    msg.className = "error";
  }
  });

function irARegistro() {
  window.location.href = "../Registro/registro.html";
}