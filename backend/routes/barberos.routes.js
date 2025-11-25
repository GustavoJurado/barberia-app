// ------------------------------------------------------
// RUTAS DE BARBEROS (VERSIÓN PRO FINAL)
// ------------------------------------------------------

import express from "express";
import { db } from "../db.js";
import { verificarToken, verificarRol } from "../middlewares/auth.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/* ======================================================
   GET /barberos
   → PROTEGIDO con token
   → Retorna SOLO {id, nombre}
   → Perfecto para selects y listas
=========================================================*/
router.get("/", verificarToken, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT id, nombre
            FROM barberos
            ORDER BY id ASC
        `);

        return res.json(rows);
    } catch (error) {
        console.error("❌ Error GET /barberos:", error);
        return res.status(500).json({ error: "Error al obtener barberos" });
    }
});

/* ======================================================
   POST /barberos (solo admin)
   → El admin crea un barbero (que ya viene con cliente_id)
=========================================================*/
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

        return res.json({ message: "Barbero creado correctamente" });
    } catch (error) {
        console.error("❌ Error POST /barberos:", error);
        return res.status(500).json({ error: "Error al crear barbero" });
    }
});

/* ======================================================
   PUT /barberos/:id (solo admin)
=========================================================*/
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

        return res.json({ message: "Barbero actualizado correctamente" });
    } catch (error) {
        console.error("❌ Error PUT /barberos:", error);
        return res.status(500).json({ error: "Error al actualizar barbero" });
    }
});

/* ======================================================
   DELETE /barberos/:id (solo admin)
=========================================================*/
router.delete("/:id", verificarToken, verificarRol("admin"), async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("DELETE FROM barberos WHERE id = ?", [id]);

        return res.json({ message: "Barbero eliminado correctamente" });
    } catch (error) {
        console.error("❌ Error DELETE /barberos:", error);
        return res.status(500).json({ error: "Error al eliminar barbero" });
    }
});

export default router;
