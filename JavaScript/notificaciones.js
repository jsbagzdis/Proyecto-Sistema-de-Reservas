const notificacionesContenedor = document.createElement("div");
notificacionesContenedor.id = "notificaciones-container";
document.body.appendChild(notificacionesContenedor);

function crearNotificacion(mensaje, tipo = "info", duracion = 4200) {
  const toast = document.createElement("div");
  toast.className = `toast-notificacion ${tipo}`;
  toast.innerHTML = `
        <div class="toast-icon">${tipo === "success" ? "✓" : tipo === "error" ? "✕" : tipo === "warning" ? "!" : "i"}</div>
        <div class="toast-text">${mensaje}</div>
    `;

  notificacionesContenedor.appendChild(toast);

  const remover = () => {
    toast.style.animation = "toast-salida 0.2s ease forwards";
    toast.addEventListener("animationend", () => toast.remove(), {
      once: true,
    });
  };

  setTimeout(remover, duracion);
  toast.addEventListener("click", remover);
  return toast;
}

function confirmarAccion(mensaje) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "toast-confirm-overlay";
    overlay.innerHTML = `
            <div class="toast-confirm-box">
                <p>${mensaje}</p>
                <div class="toast-confirm-actions">
                    <button class="toast-btn cancelar">Cancelar</button>
                    <button class="toast-btn aceptar">Confirmar</button>
                </div>
            </div>
        `;

    const btnCancelar = overlay.querySelector(".toast-btn.cancelar");
    const btnConfirmar = overlay.querySelector(".toast-btn.aceptar");

    btnCancelar.addEventListener("click", () => {
      document.body.removeChild(overlay);
      resolve(false);
    });

    btnConfirmar.addEventListener("click", () => {
      document.body.removeChild(overlay);
      resolve(true);
    });

    document.body.appendChild(overlay);
  });
}

window.crearNotificacion = crearNotificacion;
window.confirmarAccion = confirmarAccion;
