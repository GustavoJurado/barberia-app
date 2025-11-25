// ------------------------------------------------------
// CONTROLADOR: lógica para manejar servicios
// ------------------------------------------------------

import { db } from "../db.js";

// ------------------------------------------------------
// GET -> Obtener todos los servicios
// ------------------------------------------------------
export const getServicios = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM servicios");
        res.json(rows);
    } catch (error) {
        console.error("❌ Error al obtener servicios:", error);
        res.status(500).json({ error: "Error al obtener servicios" });
    }
};

// ------------------------------------------------------
// POST -> Crear un nuevo servicio
// ------------------------------------------------------
export const crearServicio = async (req, res) => {
    try {
        const { nombre, precio, duracion_minutos } = req.body;

        if (!nombre || !precio || !duracion_minutos) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        await db.query(
            "INSERT INTO servicios (nombre, precio, duracion_minutos) VALUES (?, ?, ?)",
            [nombre, precio, duracion_minutos]
        );

        res.json({ message: "Servicio creado correctamente" });
    } catch (error) {
        console.error("❌ Error al crear servicio:", error);
        res.status(500).json({ error: "Error al crear servicio" });
    }
};

// ------------------------------------------------------
// PUT -> Actualizar un servicio
// ------------------------------------------------------
export const actualizarServicio = async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, duracion_minutos } = req.body;

    try {
        await db.query(
            "UPDATE servicios SET nombre=?, precio=?, duracion_minutos=? WHERE id=?",
            [nombre, precio, duracion_minutos, id]
        );

        res.json({ message: "Servicio actualizado" });
    } catch (error) {
        console.error("❌ Error al actualizar servicio:", error);
        res.status(500).json({ error: "Error al actualizar servicio" });
    }
};

// ------------------------------------------------------
// DELETE -> Eliminar un servicio
// ------------------------------------------------------
export const eliminarServicio = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query("DELETE FROM servicios WHERE id=?", [id]);
        res.json({ message: "Servicio eliminado" });
    } catch (error) {
        console.error("❌ Error al eliminar servicio:", error);
        res.status(500).json({ error: "Error al eliminar servicio" });
    }
};
