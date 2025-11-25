import { apiGet, apiDelete, apiPut } from "./api.js";
import { protegerRuta } from "./auth.js";

// Proteger página
protegerRuta();

const contenedor = document.getElementById("lista-citas");

// -------------------------------------------
// Cargar citas del cliente
// -------------------------------------------
async function cargarMisCitas() {

    const data = await apiGet("/clientes/mis-citas", true);

    contenedor.innerHTML = "";

    if (!data || !data.citas || data.citas.length === 0) {
        contenedor.innerHTML = `
            <p style="text-align:center; color:#aaa; margin-top:2rem;">
               No tienes citas aún.
            </p>`;
        return;
    }

    data.citas.forEach(cita => {
        contenedor.innerHTML += `
            <div class="service-card">
                <div class="service-body">
                    <h3>${cita.servicio}</h3>
                    <p><strong>Barbero:</strong> ${cita.barbero}</p>
                    <p><strong>Fecha:</strong> ${cita.fecha}</p>
                    <p><strong>Hora:</strong> ${cita.hora_inicio} - ${cita.hora_fin}</p>
                    <p><strong>Estado:</strong> ${cita.estado}</p>

                    ${
                        cita.estado === "pendiente"
                        ? `<button class="btn-cancelar" onclick="cancelarCita(${cita.id})">
                           Cancelar
                           </button>`
                        : ""
                    }
                </div>
            </div>
        `;
    });
}

// -------------------------------------------
// Cancelar cita
// -------------------------------------------
window.cancelarCita = async function (id) {
    const ok = confirm("¿Seguro que deseas cancelar esta cita?");
    if (!ok) return;

    const res = await apiPut(`/citas/${id}`, { estado: "cancelada" }, true);

    if (res.error) {
        alert("No se pudo cancelar la cita");
        return;
    }

    alert("Cita cancelada");
    cargarMisCitas();
};

// Inicial
cargarMisCitas();
