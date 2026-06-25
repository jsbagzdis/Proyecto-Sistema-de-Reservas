const form = document.getElementById("loginForm");// Capturamos el formulario para agregarle el evento de submit

form.addEventListener("submit", async function(e) {
  e.preventDefault();// Evitamos que el formulario se envíe y recargue la página

  // Capturamos los valores ingresados por el usuario

  const userIngresado = document.getElementById("usuario").value.trim();
  const passIngresada = document.getElementById("password").value.trim();
  const msg = document.getElementById("mensaje");

  
  


  // 2. Validar campos vacíos
  if (!userIngresado || !passIngresada) {
    msg.textContent = "Completa todos los campos";
    msg.className = "error";
    return;
  }

 try{

  const respuesta = await fetch("http://localhost:3000/api/usuarios/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      usuario: userIngresado,
      password: passIngresada
    })
  });

  const datos = await respuesta.json();

  if (respuesta.ok) {
    msg.textContent = datos.msg;
    msg.className = "correcto";

    localStorage.setItem("usuarioLogueado", JSON.stringify(datos.usuario));

    setTimeout(() => {
      window.location.href = "../Html/reserva.html";
    }, 1000);
  }
  else {
    msg.textContent = "Usuario o contraseña incorrectos";
    msg.className = "error";
  }
 } catch (error) {
      console.error("Error al iniciar sesión:", error);
      msg.textContent = "No se pudo conectar al servidor. Intenta nuevamente más tarde.";
      msg.className = "error";
  }
  });

  function irARegistro() {
    window.location.href = "../Html/registro.html";
  }
