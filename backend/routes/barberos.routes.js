import express from "express";
import { db } from "../db.js";
import { verificarToken, verificarRol } from "../middlewares/auth.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Obtener lista de barberos
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                b.id,
                b.nombre,
                b.foto,
                b.cliente_id,
                c.email
            FROM barberos b
            LEFT JOIN clientes c ON c.id = b.cliente_id
            ORDER BY b.id ASC`
        );
        res.json(rows);
    } catch (err) {
        console.error("❌ Error al obtener barberos:", err);
        res.status(500).json({ error: "Error al obtener barberos" });
    }
});

// Crear barbero
router.post("/", verificarToken, verificarRol("admin"), async (req, res) => {
    try {
        const { nombre, foto, cliente_id } = req.body;

        if (!nombre) return res.status(400).json({ error: "Nombre requerido" });

        await db.query(
            `INSERT INTO barberos (nombre, foto, cliente_id)
            VALUES (?, ?, ?)`,
            [nombre, foto || null, cliente_id || null]
        );

        res.json({ message: "Barbero creado correctamente" });
    } catch (err) {
        console.error("❌ Error creando barbero:", err);
        res.status(500).json({ error: "Error al crear barbero" });
    }
});

// Editar barbero
router.put("/:id", verificarToken, verificarRol("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, foto, email, password } = req.body;

        if (!nombre) return res.status(400).json({ error: "Nombre requerido" });

        const [rows] = await db.query("SELECT cliente_id FROM barberos WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ error: "Barbero no encontrado" });

        const clienteId = rows[0].cliente_id;

        await db.query(
            `UPDATE barberos SET nombre=?, foto=? WHERE id=?`,
            [nombre, foto || null, id]
        );

        if (clienteId) {
            if (email) {
                await db.query(`UPDATE clientes SET email=? WHERE id=?`, [email, clienteId]);
            }
            if (password) {
                const hashed = await bcrypt.hash(password, 10);
                await db.query(`UPDATE clientes SET password=? WHERE id=?`, [hashed, clienteId]);
            }
        }

        res.json({ message: "Barbero actualizado correctamente" });

    } catch (err) {
        console.error("❌ Error actualizando barbero:", err);
        res.status(500).json({ error: "Error al actualizar barbero" });
    }
});

// Eliminar barbero
router.delete("/:id", verificarToken, verificarRol("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM barberos WHERE id=?", [id]);
        res.json({ message: "Barbero eliminado correctamente" });
    } catch (err) {
        console.error("❌ Error al eliminar:", err);
        res.status(500).json({ error: "Error al eliminar barbero" });
    }
});

export default router;
