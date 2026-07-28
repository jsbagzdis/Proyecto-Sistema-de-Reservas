document.addEventListener("DOMContentLoaded", () => {
    const navCanchas = document.getElementById("nav-canchas");
    if (!navCanchas) return;

    const usuarioString = localStorage.getItem("usuarioLogueado");
    if (!usuarioString) return;

    const usuario = JSON.parse(usuarioString);
    const esAdmin = usuario.rol === "admin" || usuario.rol === "administrador";

    if (esAdmin) {
        navCanchas.style.display = "block";
    }
});
