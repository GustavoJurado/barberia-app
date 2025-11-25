// Mostrar texto en un elemento
export function mostrarTexto(id, texto) {
    document.getElementById(id).innerText = texto;
}

// Llenar un SELECT
export function llenarSelect(id, lista, propiedad = "nombre") {
    const sel = document.getElementById(id);
    sel.innerHTML = "";

    if (!lista || lista.length === 0) {
        sel.innerHTML = `<option value="">No disponible</option>`;
        return;
    }

    lista.forEach(item => {
        const op = document.createElement("option");
        op.value = item.id;
        op.textContent = item[propiedad];
        sel.appendChild(op);
    });
}
