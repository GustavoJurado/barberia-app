// ------------------------------------------------------
// home.js — Lógica del Home público/logueado
// ------------------------------------------------------

import { usuarioActual, logout } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const usuario = usuarioActual();

    const btnAdmin = document.getElementById("btnAdmin");
    const btnBarbero = document.getElementById("btnBarbero");
    const btnSalir = document.getElementById("btnSalir");
    const txtBienvenida = document.getElementById("txtBienvenida");

    // Si NO hay usuario logueado
    if (!usuario) {
        // Ocultar botones de panel y salir
        if (btnAdmin) btnAdmin.style.display = "none";
        if (btnBarbero) btnBarbero.style.display = "none";
        if (btnSalir) btnSalir.style.display = "none";

        if (txtBienvenida) {
            txtBienvenida.textContent = "Bienvenido a Imperio Barber Shop";
        }
        return;
    }

    // Hay usuario logueado
    if (txtBienvenida) {
        txtBienvenida.textContent = `Bienvenido, ${usuario.nombre}`;
    }

    // Mostrar botón salir
    if (btnSalir) {
        btnSalir.style.display = "inline-block";
        btnSalir.onclick = () => logout();
    }

    // Mostrar u ocultar botones de panel según el rol
    if (usuario.rol === "admin") {
        if (btnAdmin) btnAdmin.style.display = "inline-block";
        if (btnBarbero) btnBarbero.style.display = "none";
    } else if (usuario.rol === "barbero") {
        if (btnAdmin) btnAdmin.style.display = "none";
        if (btnBarbero) btnBarbero.style.display = "inline-block";
    } else {
        // cliente normal
        if (btnAdmin) btnAdmin.style.display = "none";
        if (btnBarbero) btnBarbero.style.display = "none";
    }
});
