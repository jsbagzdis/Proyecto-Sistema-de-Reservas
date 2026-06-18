document.addEventListener("DOMContentLoaded", function() {
    //Recupera los datos que el Login guardó en la sesión
    const datosSesion = sessionStorage.getItem("usuarioLogueado");

    // Si no hay datos, redirige al Login
    if (!datosSesion) {
        alert("Debes iniciar sesión para acceder a tu perfil.");
        window.location.href = "../Html/login.html";
        return;
    }

    // Convertimos a un objeto JavaScript
    const usuario = JSON.parse(datosSesion);

    // 3. CARGAMOS LOS DATOS DE LA BD EN LAS CAJAS
    // .value hace que el texto sea visible y completamente modificable por el usuario
    document.getElementById("perfilNombre").value = usuario.nombre || "";
    document.getElementById("perfilUsuario").value = usuario.usuario || "";
    document.getElementById("perfilCorreo").value = usuario.email || "";

    r
    if (usuario.telefono === "000000000" || !usuario.telefono) {
        document.getElementById("perfilTelefono").value = ""; 
    } else {
        document.getElementById("perfilTelefono").value = usuario.telefono;
    }
});

// MODIFICAR Y GUARDAR LOS DATOS NUEVOS
function guardarCambios() {
    const datosSesion = sessionStorage.getItem("usuarioLogueado");
    const usuarioActual = JSON.parse(datosSesion);

    // Capturamos lo que el usuario haya modificado o escrito en la pantalla
    const usuarioModificado = {
        id: usuarioActual.id, // ID oculto necesario para saber a qué usuario actualizar en MySQL
        nombre: document.getElementById("perfilNombre").value,
        usuario: document.getElementById("perfilUsuario").value,
        email: document.getElementById("perfilCorreo").value,
        telefono: document.getElementById("perfilTelefono").value
    };

    // Enviamos los datos editados a la base de datos
    fetch('http://localhost:3000/api/usuarios/actualizar', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioModificado)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error || data.msg?.includes('error')) {
            alert("Error al actualizar: " + (data.error || data.msg));
        } else {
            alert("¡Perfil actualizado con éxito en la Base de Datos!");
            
            // ACTUALIZAMOS LA SESIÓN LOCAL: Guardamos los nuevos datos en el sessionStorage
            // para que al recargar la página persistan los cambios en pantalla
            sessionStorage.setItem("usuarioLogueado", JSON.stringify(usuarioModificado));
        }
    })
    .catch(error => {
        console.error("Error al conectar con el servidor:", error);
        alert("No se pudo conectar con el servidor backend.");
    });
}

// Abandoanr sesion
function cerrarSesion() {
    sessionStorage.removeItem("usuarioLogueado"); 
    window.location.href = "../Html/login.html";   
}