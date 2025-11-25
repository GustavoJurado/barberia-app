// ------------------------------------------------------
// auth.js — login, registro y protección de rutas
// ------------------------------------------------------

import { apiPost } from "./api.js";

// ------------------------------------------------------
// LOGIN
// ------------------------------------------------------
export async function login(email, password) {
    const res = await apiPost("/auth/login", { email, password });

    if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("usuario", JSON.stringify(res.usuario));

        // Redireccionar según rol
        if (res.usuario.rol === "admin") {
            window.location.href = "home-admin.html";
        } else if (res.usuario.rol === "barbero") {
            window.location.href = "home-barbero.html";
        } else {
            window.location.href = "home.html"; // cliente
        }

        return true;
    }

    return false;
}

// ------------------------------------------------------
// REGISTRO
// ------------------------------------------------------
export async function register(nombre, email, password, rol = "cliente") {
    return await apiPost("/auth/register", { nombre, email, password, rol });
}

// ------------------------------------------------------
// PROTEGER RUTA
// ------------------------------------------------------
export function protegerRuta() {
    const token = localStorage.getItem("token");
    if (!token) {
        // Si no hay token -> enviar a la landing pública
        window.location.href = "index.html";
    }
}

// ------------------------------------------------------
// OBTENER USUARIO ACTUAL
// ------------------------------------------------------
export function usuarioActual() {
    return JSON.parse(localStorage.getItem("usuario"));
}

// ------------------------------------------------------
// LOGOUT
// ------------------------------------------------------
export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    // Después de cerrar sesión → enviar al Home público
    window.location.href = "index.html";
}
