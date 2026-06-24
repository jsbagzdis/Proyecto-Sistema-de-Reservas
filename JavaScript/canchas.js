const API_URL = 'http://localhost:3000/api'; 
let todasLasCanchas = []; 
let canchaSeleccionadaId = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarCanchas();
    cargarDeportes();

    // Lógica del Modal
    const modal = document.getElementById('modal-cancha');
    const btnAbrir = document.getElementById('btn-abrir-modal');
    const btnCerrar = document.getElementById('btn-cerrar-modal');
    const btnGuardar = document.getElementById('btn-guardar-cancha');

    if (btnAbrir) btnAbrir.addEventListener('click', () => modal.classList.remove('hidden'));
    if (btnCerrar) btnCerrar.addEventListener('click', () => modal.classList.add('hidden'));
    if (btnGuardar) btnGuardar.addEventListener('click', crearCancha);

    // Lógica de búsqueda por nombre
    const btnBuscar = document.getElementById('btn-buscar');
    if(btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            const termino = document.getElementById('input-buscar').value.toLowerCase();
            const filtradas = todasLasCanchas.filter(c => 
                c.nombre.toLowerCase().includes(termino)
            );
            renderizarCanchas(filtradas);
        });
    }

    // Lógica para Filtrar por Deporte
    const selectFiltro = document.getElementById('select-deportes');
    if (selectFiltro) {
        selectFiltro.addEventListener('change', () => {
            const deporteSeleccionado = selectFiltro.value; 
            
            if (deporteSeleccionado === "") {
                // Muestra todas si elige la opción por defecto
                renderizarCanchas(todasLasCanchas);
            } else {
                // Filtra por DeporteId
                const canchasFiltradas = todasLasCanchas.filter(cancha => 
                    cancha.DeporteId == deporteSeleccionado 
                );
                renderizarCanchas(canchasFiltradas);
            }
        });
    }
});

// 1. OBTENER Y LISTAR CANCHAS
async function cargarCanchas() {
   try {
        const res = await fetch(`${API_URL}/canchas`);
        todasLasCanchas = await res.json(); 
        renderizarCanchas(todasLasCanchas); 
    } catch (error) {
        console.error("Error cargando canchas:", error);
    }
}

// Función que dibuja las tarjetas en el HTML
function renderizarCanchas(lista) {
    const contenedor = document.getElementById('contenedor-canchas');
    contenedor.innerHTML = '';
    
    lista.forEach(cancha => {
        contenedor.innerHTML += `
            <div class="cancha-card">
                <h3>${cancha.nombre}</h3>
                <p><strong>Deporte:</strong> ${cancha.Deporte?.nombre || 'N/A'}</p>
                <p><strong>Ubicación:</strong> ${cancha.ubicacion}</p>
                <button onclick="abrirGestionTurnos(${cancha.id}, '${cancha.nombre}')" class="btn-gestionar">
                    Gestionar Turnos
                    </button>
            </div>
        `;
    });
}

function abrirGestionTurnos(canchaId, nombreCancha) {
    canchaSeleccionadaId = canchaId;
    const modal = document.getElementById('modal-turnos');
    const titulo = document.getElementById('titulo-cancha-turnos');
    
    if(titulo) {
        titulo.textContent = "Cancha: " + nombreCancha;
    }

    cargarTurnos(canchaId);
    modal.classList.remove('hidden');
       
    console.log("Gestionando turnos de la cancha ID:", canchaId);
}

async function guardarTurno() {
    const nuevaHora = document.getElementById('input-nuevo-turno').value;
    const nuevoPrecio = document.getElementById('nuevo-precio').value;
    if(!nuevoPrecio || !nuevaHora){
        alert("Porfavor, ingrese un precio y un horario.");
        return;
    }

    if(nuevoPrecio <= 0){
        alert("Ingrese un precio valido.");
        return;
    }

    const res = await fetch(`${API_URL}/turnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            hora: nuevaHora, 
            precio: parseFloat(nuevoPrecio),
            CanchaId: canchaSeleccionadaId 
        })
    });

     if (res.ok) {
        alert("Turno guardado con éxito");
        cargarTurnos(canchaSeleccionadaId);
    } else {
        const err = await res.json();
        alert(err.error || "Error al guardar");
    }
}


async function cargarTurnos(canchaId) {
    const res = await fetch(`${API_URL}/turnos?CanchaId=${canchaId}`);
    const turnos = await res.json();
    const lista = document.getElementById('lista-turnos');
    lista.innerHTML = ''; 

    turnos.forEach(t => {
        lista.innerHTML += `
            <div class="turno-item">
                <input type="time" id="edit-${t.id}" value="${t.hora}">
                <button onclick="editarTurno(${t.id})">Guardar Cambios</button>
                <span>${t.hora} - $${t.precio}</span>
                <button onclick="eliminarTurno(${t.id})">Eliminar</button>
            </div>
        `;
    });
}

async function eliminarTurno(id) {
    await fetch(`${API_URL}/turnos/${id}`, { method: 'DELETE' });
    cargarTurnos(canchaSeleccionadaId); // Refrescar lista
}

async function editarTurno(id) {
    const nuevaHora = document.getElementById(`edit-${id}`).value;
    await fetch(`${API_URL}/turnos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hora: nuevaHora })
    });
    alert("Turno actualizado");
}


async function cargarDeportes() {
    try {
        const res = await fetch(`${API_URL}/deportes`);
        const deportes = await res.json();

        console.log("Deportes encontrados en la DB:", deportes);
        
        // Esto nos mostrará cómo viene escrito el objeto (id, nombre, Id, Nombre, etc.)
        if(deportes.length > 0) {
            console.log("Estructura de un deporte:", deportes[0]);
        }

        // Llenar el <select> de filtrado de forma SEGURA
        const selectFiltro = document.getElementById('select-deportes');
        if (selectFiltro) {
            selectFiltro.innerHTML = ''; // Limpiamos primero
            
            // Creamos la opción por defecto
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "Filtrar por Deporte";
            selectFiltro.appendChild(defaultOption);

            // Agregamos cada deporte iterando el array
            deportes.forEach(dep => {
                const option = document.createElement('option');
                // Cubrimos ambas posibilidades: minúsculas o mayúsculas
                option.value = dep.id || dep.Id || dep.ID; 
                option.textContent = dep.nombre || dep.Nombre;
                selectFiltro.appendChild(option);
            });
        }

        // Llenar el <datalist> (Sugerencias al crear)
        const datalist = document.getElementById('lista-deportes');
        if (datalist) {
            datalist.innerHTML = ''; // Limpiamos primero
            deportes.forEach(dep => {
                const option = document.createElement('option');
                option.value = dep.nombre || dep.Nombre;
                datalist.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error al cargar deportes:", error);
    }
}

// 3. CREAR CANCHA Y GESTIONAR DEPORTE AUTOMÁTICAMENTE
async function crearCancha() {
    const nombre = document.getElementById('input-nombre').value.trim();
    const ubicacion = document.getElementById('input-ubicacion').value.trim();
    const tarifa = parseFloat(document.getElementById('input-tarifa').value);
    const nombreDeporte = document.getElementById('input-deporte').value.trim();

    // Validaciones
    if (!nombre || !ubicacion || !tarifa || !nombreDeporte) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    if(nombre.length < 3){
        alert("El nombre de la cancha debe tener al menos 3 caracteres.");
        return;
    }

    if (isNaN(tarifa) || tarifa <= 0) {
        alert("Por favor, ingresa una tarifa válida mayor a 0.");
        return;
    }

    try {
        // A. Verificar si el deporte existe
        const resDep = await fetch(`${API_URL}/deportes`);
        const deportes = await resDep.json();
        let deporte = deportes.find(d => d.nombre.toLowerCase() === nombreDeporte.toLowerCase());

        // B. Si no existe, crearlo
        if (!deporte) {
            const resNuevo = await fetch(`${API_URL}/deportes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nombreDeporte })
            });
            deporte = await resNuevo.json();
        }

        // C. Crear la cancha vinculada al deporte
        const resCancha = await fetch(`${API_URL}/canchas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, ubicacion, tarifa, DeporteId: deporte.id })
        });

        if (resCancha.ok) {
            alert("Cancha creada exitosamente");
            document.getElementById('modal-cancha').classList.add('hidden');
            
            // Limpiar los inputs para que no queden escritos
            document.getElementById('input-nombre').value = '';
            document.getElementById('input-ubicacion').value = '';
            document.getElementById('input-tarifa').value = '';
            document.getElementById('input-deporte').value = '';

            cargarCanchas();
            cargarDeportes();
        } else {
            const data = await resCancha.json();
            alert(data.msg || "Error al crear la cancha");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error inesperado.");
    }
}