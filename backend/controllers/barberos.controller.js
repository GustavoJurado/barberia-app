// ------------------------------------------------------
// CONTROLADOR DE BARBEROS
// ------------------------------------------------------

import { db } from "../db.js";


// ------------------------------------------------------
// Obtener lista de barberos
// ------------------------------------------------------
export const getBarberos = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                barberos.id,
                barberos.nombre,
                barberos.foto,
                barberos.cliente_id,
                clientes.email AS correo
            FROM barberos
            LEFT JOIN clientes ON clientes.id = barberos.cliente_id
            ORDER BY barberos.id ASC
        `);

        res.json(rows);

    } catch (error) {
        console.error("❌ Error al obtener barberos:", error);
        res.status(500).json({ error: "Error al obtener barberos" });
    }
};



// ------------------------------------------------------
// Crear barbero
// ------------------------------------------------------
export const crearBarbero = async (req, res) => {
    try {
        const { nombre, foto, cliente_id } = req.body;

        if (!nombre || !cliente_id) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        await db.query(
            `INSERT INTO barberos (cliente_id, nombre, foto)
             VALUES (?, ?, ?)`,
            [cliente_id, nombre, foto || null]
        );

        res.json({ message: "Barbero creado correctamente" });

    } catch (error) {
        console.error("❌ Error al crear barbero:", error);
        res.status(500).json({ error: "Error al crear barbero" });
    }
};



// ------------------------------------------------------
// Actualizar barbero
// ------------------------------------------------------
export const actualizarBarbero = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, foto } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        await db.query(
            `UPDATE barberos 
             SET nombre = ?, foto = ?
             WHERE id = ?`,
            [nombre, foto || null, id]
        );

        res.json({ message: "Barbero actualizado" });

    } catch (error) {
        console.error("❌ Error al actualizar barbero:", error);
        res.status(500).json({ error: "Error al actualizar barbero" });
    }
};



// ------------------------------------------------------
// Eliminar barbero (CORREGIDO)
// ------------------------------------------------------
export const eliminarBarbero = async (req, res) => {
    try {
        const { id } = req.params;

        // 1️⃣ Obtener cliente_id del barbero
        const [rows] = await db.query(
            "SELECT cliente_id FROM barberos WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Barbero no encontrado" });
        }

        const clienteId = rows[0].cliente_id;

        // 2️⃣ Eliminar barbero
        await db.query("DELETE FROM barberos WHERE id = ?", [id]);

        // 3️⃣ Si tenía cliente asociado → eliminarlo también
        if (clienteId) {
            await db.query("DELETE FROM clientes WHERE id = ?", [clienteId]);
        }

        res.json({ message: "Barbero y cliente asociado eliminados correctamente" });

    } catch (error) {
        console.error("❌ Error al eliminar barbero:", error);
        res.status(500).json({ error: "Error al eliminar barbero" });
    }
};
