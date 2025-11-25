// ------------------------------------------------------
// home-admin.js — Dashboard para ADMIN (VERSIÓN FINAL)
// ------------------------------------------------------

import { apiGet, apiPost, apiPut, apiDelete } from "./api.js";
import { protegerRuta, usuarioActual, logout } from "./auth.js";

let usuario = null;
window.logout = logout;

let modoBarbero = "crear";
let barberoEditandoId = null;
let clienteIdEditando = null;

// ======================================================
// Fecha hoy YYYY-MM-DD
// ======================================================
function hoyISO() {
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,"0")}-${String(h.getDate()).padStart(2,"0")}`;
}

// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {
    protegerRuta();
    usuario = usuarioActual();

    if (!usuario || usuario.rol !== "admin") {
        alert("No tienes permisos");
        return (window.location.href = "home.html");
    }

    document.getElementById("nombreAdmin").textContent = usuario.nombre;
    document.getElementById("fechaHoyAdmin").textContent = hoyISO();
    document.getElementById("fechaFiltroAdmin").value = hoyISO();

    document.getElementById("btnVerCitas").onclick = () => activarSeccion("citas");
    document.getElementById("btnVerClientes").onclick = () => activarSeccion("clientes");
    document.getElementById("btnVerBarberos").onclick = () => activarSeccion("barberos");

    document.getElementById("btnBuscarCitasAdmin").onclick = cargarCitas;

    document.getElementById("btnAbrirModalBarbero").onclick = () => abrirModalBarbero("crear");
    document.getElementById("btnCancelarModalBarbero").onclick = cerrarModalBarbero;
    document.getElementById("btnGuardarBarbero").onclick = guardarBarbero;

    await cargarResumen();
    await cargarBarberosFiltro();
    await cargarCitas();
    await cargarClientes();
    await cargarBarberos();
});

// ======================================================
// Cambiar sección
// ======================================================
function activarSeccion(seccion) {
    const botones = {
        citas: document.getElementById("btnVerCitas"),
        clientes: document.getElementById("btnVerClientes"),
        barberos: document.getElementById("btnVerBarberos")
    };

    const secciones = {
        citas: document.getElementById("sectionCitas"),
        clientes: document.getElementById("sectionClientes"),
        barberos: document.getElementById("sectionBarberos")
    };

    Object.values(botones).forEach(b => { 
        b.classList.remove("active","btn-primary"); 
        b.classList.add("btn-outline"); 
    });
    Object.values(secciones).forEach(s => s.classList.add("hidden"));

    botones[seccion].classList.remove("btn-outline");
    botones[seccion].classList.add("btn-primary","active");
    secciones[seccion].classList.remove("hidden");
}

// ======================================================
// RESUMEN
// ======================================================
async function cargarResumen() {
    try {
        const hoy = hoyISO();
        const citasHoy = await apiGet(`/citas?fecha=${hoy}`, true);
        const clientes = await apiGet("/clientes", true);
        const barberos = await apiGet("/barberos", true);

        document.getElementById("cardCitasHoy").textContent = citasHoy.length;
        document.getElementById("cardClientes").textContent = clientes.length;
        document.getElementById("cardBarberos").textContent = barberos.length;

    } catch (err) {
        console.error("Error resumen:", err);
    }
}

// ======================================================
// FILTROS BARBEROS / CITAS
// ======================================================
async function cargarBarberosFiltro() {
    try {
        const lista = await apiGet("/barberos", true);
        const sel = document.getElementById("barberoFiltroAdmin");

        sel.innerHTML = `<option value="">Todos</option>`;

        lista.forEach(b => {
            sel.innerHTML += `<option value="${b.id}">${b.nombre}</option>`;
        });

    } catch (err) {
        console.error("Error filtro barberos:", err);
    }
}

async function cargarCitas() {
    try {
        const fecha = document.getElementById("fechaFiltroAdmin").value;
        const barbero = document.getElementById("barberoFiltroAdmin").value;

        let url = "/citas";
        const params = [];
        if (fecha) params.push(`fecha=${fecha}`);
        if (barbero) params.push(`barbero_id=${barbero}`);
        if (params.length > 0) url += "?" + params.join("&");

        const lista = await apiGet(url, true);

        const tbody = document.getElementById("tbodyCitasAdmin");
        tbody.innerHTML = "";

        if (!lista.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#aaa;">No hay citas.</td></tr>`;
            return;
        }

        lista.forEach(c => {
            tbody.innerHTML += `
            <tr>
                <td>${c.fecha}</td>
                <td>${c.hora_inicio} - ${c.hora_fin}</td>
                <td>${c.cliente}</td>
                <td>${c.barbero}</td>
                <td>${c.servicio}</td>
                <td>${c.estado}</td>
                <td>
                    ${
                        c.estado === "pendiente"
                            ? `<button class="btn-primary" onclick="adminCompletarCita(${c.id})">Completar</button>
                               <button class="btn-cancelar" onclick="adminCancelarCita(${c.id})">Cancelar</button>`
                            : ""
                    }
                    <button class="btn-eliminar" onclick="adminEliminarCita(${c.id})">Eliminar</button>
                </td>
            </tr>`;
        });

    } catch (err) {
        console.error("Error citas:", err);
    }
}

// Funciones admin
window.adminCompletarCita = async id => {
    if (!confirm("¿Completar cita?")) return;
    await apiPut(`/citas/${id}`, { estado: "completada" }, true);
    cargarCitas();
    cargarResumen();
};

window.adminCancelarCita = async id => {
    if (!confirm("¿Cancelar cita?")) return;
    await apiPut(`/citas/${id}`, { estado: "cancelada" }, true);
    cargarCitas();
    cargarResumen();
};

window.adminEliminarCita = async id => {
    if (!confirm("¿Eliminar cita?")) return;
    await apiDelete(`/citas/${id}`, true);
    cargarCitas();
    cargarResumen();
};

// ======================================================
// CLIENTES
// ======================================================
async function cargarClientes() {
    const lista = await apiGet("/clientes", true);
    const tbody = document.getElementById("tbodyClientes");
    tbody.innerHTML = "";

    lista.forEach(c => {
        tbody.innerHTML += `
        <tr>
            <td>${c.id}</td>
            <td>${c.nombre}</td>
            <td>${c.email}</td>
            <td>${c.puntos}</td>
        </tr>`;
    });
}

// ======================================================
// BARBEROS
// ======================================================
async function cargarBarberos() {
    const lista = await apiGet("/barberos", true);
    const tbody = document.getElementById("tbodyBarberos");
    tbody.innerHTML = "";

    lista.forEach(b => {
        tbody.innerHTML += `
        <tr>
            <td>${b.id}</td>
            <td>${b.nombre}</td>
            <td style="text-align:center;">
                <button class="btn-primary"
                    onclick="abrirModalBarberoEditar(${b.id}, '${escapeHTML(b.nombre)}')">
                    ✏️
                </button>
                <button class="btn-eliminar"
                    onclick="adminEliminarBarbero(${b.id})">
                    🗑
                </button>
            </td>
        </tr>`;
    });
}

function escapeHTML(t) {
    return t ? t.replace(/"/g,"&quot;").replace(/'/g,"&#39;") : "";
}

// ======================================================
// MODAL BARBERO
// ======================================================
function abrirModalBarbero(modo) {
    modoBarbero = modo;
    barberoEditandoId = null;
    clienteIdEditando = null;

    document.getElementById("campoNombreBarbero").value = "";
    document.getElementById("campoEmailBarbero").value = "";
    document.getElementById("campoPasswordBarbero").value = "";
    document.getElementById("campoFotoBarbero").value = "";

    document.getElementById("tituloModalBarbero").textContent = "Agregar Barbero";
    document.getElementById("modalBarberoOverlay").style.display = "flex";
}

window.abrirModalBarberoEditar = function(id, nombre) {
    modoBarbero = "editar";
    barberoEditandoId = id;

    document.getElementById("campoNombreBarbero").value = nombre;
    document.getElementById("campoEmailBarbero").value = "";
    document.getElementById("campoFotoBarbero").value = "";
    document.getElementById("campoPasswordBarbero").value = "";

    document.getElementById("tituloModalBarbero").textContent = "Editar Barbero";
    document.getElementById("modalBarberoOverlay").style.display = "flex";
};

function cerrarModalBarbero() {
    document.getElementById("modalBarberoOverlay").style.display = "none";
}

// ======================================================
// GUARDAR BARBERO
// ======================================================
async function guardarBarbero() {
    const nombre = document.getElementById("campoNombreBarbero").value.trim();
    const email  = document.getElementById("campoEmailBarbero").value.trim();
    const pass   = document.getElementById("campoPasswordBarbero").value.trim();
    const foto   = document.getElementById("campoFotoBarbero").value.trim();

    if (!nombre) return alert("Nombre obligatorio");

    // -------- CREAR --------
    if (modoBarbero === "crear") {
        if (!email || !pass) return alert("Correo y contraseña obligatorios");

        // 1) Crear usuario tipo barbero
        const nuevo = await apiPost("/auth/register", {
            nombre,
            email,
            password: pass,
            rol: "barbero"
        });

        // 2) Crear registro barbero
        await apiPost("/barberos", {
            nombre,
            foto: foto || null,
            cliente_id: nuevo.id
        }, true);
    }
    // -------- EDITAR --------
    else {

        await apiPut(`/barberos/${barberoEditandoId}`, {
            nombre,
            foto: foto || null
        }, true);
    }

    cerrarModalBarbero();
    cargarBarberos();
    cargarResumen();
    cargarBarberosFiltro();
}

// ======================================================
// ELIMINAR BARBERO
// ======================================================
window.adminEliminarBarbero = async id => {
    if (!confirm("¿Eliminar barbero?")) return;
    await apiDelete(`/barberos/${id}`, true);
    cargarBarberos();
    cargarBarberosFiltro();
    cargarResumen();
};
