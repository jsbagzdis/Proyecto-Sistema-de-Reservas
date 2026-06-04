const boton = document.getElementById("btnEnviar");
const msj = document.getElementById("mensaje");
const contenedor = document.getElementById("contenedorTurnos");

boton.addEventListener("click", function(e) {
    e.preventDefault();

   
    document.querySelectorAll('input, select').forEach(el => el.classList.remove('input-error'));
    msj.textContent = "";
    msj.className = "";

   
    const deporte = document.getElementById("deporte").value;
    const fecha = document.getElementById("fecha").value;
    const horario = document.getElementById("horario").value;
    const duracion = document.getElementById("duracion").value;

    
    if (deporte === "") {
        document.getElementById("deporte").classList.add("input-error");
        msj.textContent = "Falta seleccionar el deporte.";
        msj.classList.add("msj-rojo");
        return;
    }
    if (fecha === "") {
        document.getElementById("fecha").classList.add("input-error");
        msj.textContent = "Falta elegir una fecha.";
        msj.classList.add("msj-rojo");
        return;
    }
    if (horario === "") {
        document.getElementById("horario").classList.add("input-error");
        msj.textContent = "Falta elegir un horario.";
        msj.classList.add("msj-rojo");
        return;
    }
    if (duracion === "") {
        document.getElementById("duracion").classList.add("input-error");
        msj.textContent = "Falta elegir la duración.";
        msj.classList.add("msj-rojo");
        return;
    }

   
    const ahora = new Date();

    const reserva = new Date(fecha + "T" + horario); 

    if (reserva < ahora) {
        document.getElementById("fecha").classList.add("input-error");
        document.getElementById("horario").classList.add("input-error");
        msj.textContent = "Error: La fecha o el horario ya pasaron.";
        msj.classList.add("msj-rojo");
        return;
    }


    msj.textContent = "¡Búsqueda exitosa! Elegí tu cancha abajo.";
    msj.classList.add("msj-verde");

    
    contenedor.innerHTML = '<h2>Turnos Disponibles</h2>'; 
    
    const turnosGenericos = [
        { cancha: "Cancha 1", tipo: "Techada", precio: "$5000" },
        { cancha: "Cancha 2", tipo: "Descubierta", precio: "$4000" }
    ];

    turnosGenericos.forEach(turno => {
        contenedor.innerHTML += `
            <div class="turno-item">
                <div>
                    <strong>${turno.cancha} - ${turno.tipo}</strong><br>
                    <span>${horario} hs | ${turno.precio}</span>
                </div>
                <button class="btnReservarItem" onclick="confirmarTurno('${turno.cancha}', '${turno.precio}')">Reservar</button>
            </div>
        `;
    });
});


window.confirmarTurno = function(cancha, precio) {
    const deporteElegido = document.getElementById("deporte").value;
    const horaElegida = document.getElementById("horario").value;

    msj.textContent = `¡Reserva Confirmada! ${deporteElegido} en ${cancha} a las ${horaElegida} hs. Total: ${precio}.`;
    msj.className = "msj-verde";
    
    contenedor.innerHTML = '<h2>Turnos Disponibles</h2>'; 
};