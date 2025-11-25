// ------------------------------------------------------
// ui.js — utilidades para manipular la interfaz
// ------------------------------------------------------

export function mostrarTexto(id, texto) {
    document.getElementById(id).innerText = texto;
}

export function llenarSelect(id, lista, propiedad = "nombre") {
    const sel = document.getElementById(id);
    sel.innerHTML = "";
    lista.forEach(item => {
        const op = document.createElement("option");
        op.value = item.id;
        op.textContent = item[propiedad];
        sel.appendChild(op);
    });
}
