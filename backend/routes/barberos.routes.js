// ------------------------------------------------------
// RUTAS DE BARBEROS (VERSIÓN FULL CORREGIDA)
// ------------------------------------------------------

import express from "express";
import { db } from "../db.js";
import { verificarToken, verificarRol } from "../middlewares/auth.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// ------------------------------------------------------
// GET -> Listar barberos (PROTEGIDO)
// Solo devuelve: id, nombre
// ------------------------------------------------------
router.get("/", verificarToken, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT id, nombre
            FROM barberos
            ORDER BY id ASC
        `);

        res.json(rows);

    } catch (error) {
        console.error("❌ Error al obtener barberos:", error);
        res.status(500).json({ error: "Error al obtener barberos" });
    }
});

// ------------------------------------------------------
// POST -> Crear barbero (solo admin)
// Requiere: nombre, foto (opcional), cliente_id
// ------------------------------------------------------
router.post("/", verificarToken, verificarRol("admin"), async (req, res) => {
    try {
        const { nombre, foto, cliente_id } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        await db.query(
            `INSERT INTO barberos (nombre, foto, cliente_id)
             VALUES (?, ?, ?)`,
            [nombre, foto || null, cliente_id || null]
        );

        res.json({ message: "Barbero creado correctamente" });

    } catch (error) {
        console.error("❌ Error al crear barbero:", error);
        res.status(500).json({ error: "Error al crear barbero" });
    }
});

// ------------------------------------------------------
// PUT -> Editar barbero
// Actualiza: nombre, foto
// ------------------------------------------------------
router.put("/:id", verificarToken, verificarRol("admin"), async (req, res) => {
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

        res.json({ message: "Barbero actualizado correctamente" });

    } catch (error) {
        console.error("❌ Error al actualizar barbero:", error);
        res.status(500).json({ error: "Error al actualizar barbero" });
    }
});

// ------------------------------------------------------
// DELETE -> Eliminar barbero
// NO elimina el cliente asociado
// ------------------------------------------------------
router.delete("/:id", verificarToken, verificarRol("admin"), async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("DELETE FROM barberos WHERE id = ?", [id]);

        res.json({ message: "Barbero eliminado correctamente" });

    } catch (error) {
        console.error("❌ Error al eliminar barbero:", error);
        res.status(500).json({ error: "Error al eliminar barbero" });
    }
});

export default router;
