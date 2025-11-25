// ------------------------------------------------------
// api.js — funciones para consumir el backend en producción
// ------------------------------------------------------

// 🔥 URL del backend en Render
const API_URL = "https://barberia-app-hx7w.onrender.com";

// GET
export async function apiGet(url, auth = false) {
    const headers = {};

    if (auth) {
        headers["Authorization"] = "Bearer " + localStorage.getItem("token");
    }

    const res = await fetch(API_URL + url, { headers });
    return await res.json();
}

// POST
export async function apiPost(url, data, auth = false) {
    const headers = {
        "Content-Type": "application/json"
    };

    if (auth) {
        headers["Authorization"] = "Bearer " + localStorage.getItem("token");
    }

    const res = await fetch(API_URL + url, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
    });

    return await res.json();
}

// PUT
export async function apiPut(url, data, auth = false) {
    const headers = {
        "Content-Type": "application/json"
    };

    if (auth) {
        headers["Authorization"] = "Bearer " + localStorage.getItem("token");
    }

    const res = await fetch(API_URL + url, {
        method: "PUT",
        headers,
        body: JSON.stringify(data)
    });

    return await res.json();
}

// DELETE
export async function apiDelete(url, auth = false) {
    const headers = {};

    if (auth) {
        headers["Authorization"] = "Bearer " + localStorage.getItem("token");
    }

    const res = await fetch(API_URL + url, {
        method: "DELETE",
        headers
    });

    return await res.json();
}
