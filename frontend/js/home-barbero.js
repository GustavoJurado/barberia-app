// ------------------------------------------------------
// home-barbero.js — Dashboard para BARBERO
// ------------------------------------------------------

import { apiGet, apiPut } from "./api.js";
import { protegerRuta, usuarioActual, logout } from "./auth.js";

let usuario = null;

window.logout = logout;

// Helper fecha hoy en YYYY-MM-DD
function hoyISO() {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, "0");
    const d = String(hoy.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// ------------------------------------------------------
// Inicialización
// ------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    protegerRuta();
    usuario = usuarioActual();

    if (!usuario || (usuario.rol !== "barbero" && usuario.rol !== "admin")) {
        alert("No tienes permisos para ver este panel");
        window.location.href = "home.html";
        return;
    }

    document.getElementById("nombreBarbero").textContent = usuario.nombre;
    document.getElementById("rolUsuario").textContent = usuario.rol;
    document.getElementById("fechaHoyTexto").textContent = hoyISO();

    // Fecha por defecto: hoy
    document.getElementById("fechaFiltro").value = hoyISO();

    // Listeners
    document.getElementById("btnBuscar").addEventListener("click", cargarCitas);
    document.getElementById("btnVerHoy").addEventListener("click", () => {
        document.getElementById("fechaFiltro").value = hoyISO();
        cargarCitas();
    });
    document.getElementById("btnVerTodas").addEventListener("click", () => {
        document.getElementById("fechaFiltro").value = "";
        cargarCitas();
    });

    await cargarBarberos();
    await cargarCitas();
});

// ------------------------------------------------------
// Cargar barberos en filtro
// ------------------------------------------------------
async function cargarBarberos() {
    try {
        const lista = await apiGet("/barberos");
        const select = document.getElementById("barberoFiltro");

        lista.forEach(b => {
            const opt = document.createElement("option");
            opt.value = b.id;
            opt.textContent = b.nombre;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error("Error cargando barberos:", err);
    }
}

// ------------------------------------------------------
// Cargar citas según filtros
// ------------------------------------------------------
async function cargarCitas() {
    try {
        const fecha = document.getElementById("fechaFiltro").value;
        const barberoFiltro = document.getElementById("barberoFiltro").value;

        let url = "/citas";
        const params = [];

        if (fecha) params.push(`fecha=${fecha}`);

        // Si el barbero elige un barbero específico, se usa ese.
        // Si deja vacío, mostramos SOLO las citas donde el barbero coincide con su nombre.
        if (barberoFiltro) {
            params.push(`barbero_id=${barberoFiltro}`);
        }

        if (params.length > 0) {
            url += "?" + params.join("&");
        }

        const citas = await apiGet(url, true);
        const tbody = document.getElementById("tbodyCitasBarbero");
        tbody.innerHTML = "";

        if (!citas || citas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;color:#aaa;">
                        No hay citas para los filtros seleccionados.
                    </td>
                </tr>
            `;
            actualizarCards([]);
            return;
        }

        // Si NO se seleccionó barbero, filtramos por nombre de barbero = usuario.nombre
        const citasFiltradas = barberoFiltro
            ? citas
            : citas.filter(c => c.barbero === usuario.nombre);

        if (citasFiltradas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;color:#aaa;">
                        No tienes citas asignadas con estos filtros.
                    </td>
                </tr>
            `;
            actualizarCards([]);
            return;
        }

        citasFiltradas.forEach(cita => {
            let botones = "";

            if (cita.estado === "pendiente") {
                botones += `
                    <button class="btn-primary" style="margin-right:4px;"
                        onclick="completarCita(${cita.id})">Completar</button>
                    <button class="btn-cancelar"
                        onclick="cancelarCita(${cita.id})">Cancelar</button>
                `;
            } else {
                botones = "-";
            }

            tbody.innerHTML += `
                <tr>
                    <td>${cita.hora_inicio} - ${cita.hora_fin}</td>
                    <td>${cita.cliente}</td>
                    <td>${cita.servicio}</td>
                    <td>${cita.estado}</td>
                    <td>${botones}</td>
                </tr>
            `;
        });

        actualizarCards(citasFiltradas);

    } catch (err) {
        console.error("Error cargando citas:", err);
    }
}

// ------------------------------------------------------
// Actualizar tarjetas de resumen
// ------------------------------------------------------
function actualizarCards(citas) {
    const total = citas.length;
    const pendientes = citas.filter(c => c.estado === "pendiente").length;
    const completadas = citas.filter(c => c.estado === "completada").length;
    const canceladas = citas.filter(c => c.estado === "cancelada").length;

    document.getElementById("cardTotalHoy").textContent = total;
    document.getElementById("cardPendientes").textContent = pendientes;
    document.getElementById("cardCompletadas").textContent = completadas;
    document.getElementById("cardCanceladas").textContent = canceladas;
}

// ------------------------------------------------------
// Acciones sobre citas
// ------------------------------------------------------
window.completarCita = async function (id) {
    const ok = confirm("¿Marcar cita como COMPLETADA?");
    if (!ok) return;

    const res = await apiPut(`/citas/${id}`, { estado: "completada" }, true);
    if (res.error) {
        alert(res.error);
    } else {
        alert("Cita completada");
    }
    cargarCitas();
};

window.cancelarCita = async function (id) {
    const ok = confirm("¿Cancelar esta cita?");
    if (!ok) return;

    const res = await apiPut(`/citas/${id}`, { estado: "cancelada" }, true);
    if (res.error) {
        alert(res.error);
    } else {
        alert("Cita cancelada");
    }
    cargarCitas();
};
