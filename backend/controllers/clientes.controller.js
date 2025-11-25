// ------------------------------------------------------
// CONTROLADOR: contiene la lógica para manejar clientes
// ------------------------------------------------------

import { db } from "../db.js";
import bcrypt from "bcryptjs";

// ------------------------------------------------------
// GET -> Obtener todos los clientes
// ------------------------------------------------------
export const getClientes = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM clientes");
        res.json(rows);
    } catch (error) {
        console.error("❌ Error al obtener clientes:", error);
        res.status(500).json({ error: "Error al obtener clientes" });
    }
};

// ------------------------------------------------------
// POST -> Crear un nuevo cliente (PRUEBAS)
// ------------------------------------------------------
export const crearCliente = async (req, res) => {
    try {
        const { nombre, email, password, rol, puntos } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        await db.query(
            "INSERT INTO clientes (nombre, email, password, puntos, rol) VALUES (?, ?, ?, ?, ?)",
            [nombre, email, password, puntos ?? 0, rol ?? "cliente"]
        );

        res.json({ message: "Cliente creado correctamente" });
    } catch (error) {
        console.error("❌ Error al crear cliente:", error);
        res.status(500).json({ error: "Error al crear cliente" });
    }
};

// ------------------------------------------------------
// PUT -> Actualizar cliente (ACTUALIZACIÓN PARCIAL REAL)
// ------------------------------------------------------
export const actualizarCliente = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id || id === "null") {
            return res.status(400).json({ error: "ID inválido" });
        }

        // 1) Obtener datos actuales
        const [rows] = await db.query(
            "SELECT * FROM clientes WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        const actual = rows[0];

        // 2) Construir actualización parcial
        const nuevoNombre = req.body.nombre ?? actual.nombre;
        const nuevoEmail  = req.body.email  ?? actual.email;
        const nuevoPuntos = req.body.puntos ?? actual.puntos;
        const nuevoRol    = req.body.rol    ?? actual.rol;

        let nuevoPassword = actual.password;

        if (req.body.password && req.body.password.trim() !== "") {
            nuevoPassword = await bcrypt.hash(req.body.password, 10);
        }

        // 3) Ejecutar UPDATE real
        await db.query(
            `UPDATE clientes 
             SET nombre=?, email=?, password=?, puntos=?, rol=?
             WHERE id=?`,
            [nuevoNombre, nuevoEmail, nuevoPassword, nuevoPuntos, nuevoRol, id]
        );

        res.json({ message: "Cliente actualizado correctamente" });

    } catch (error) {
        console.error("❌ Error al actualizar cliente:", error);
        res.status(500).json({ error: "Error al actualizar cliente" });
    }
};

// ------------------------------------------------------
// DELETE -> Eliminar cliente
// ------------------------------------------------------
export const eliminarCliente = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query("DELETE FROM clientes WHERE id=?", [id]);
        res.json({ message: "Cliente eliminado" });
    } catch (error) {
        console.error("❌ Error al eliminar cliente:", error);
        res.status(500).json({ error: "Error al eliminar cliente" });
    }
};

// ------------------------------------------------------
// RESTO DE MÉTODOS (SIN CAMBIOS)
// ------------------------------------------------------

export const getMisCitas = async (req, res) => {
    try {
        const clienteId = req.usuario.id;

        const [citas] = await db.query(
            `SELECT 
                c.id, c.fecha, c.hora_inicio, c.hora_fin, c.estado,
                b.nombre AS barbero,
                s.nombre AS servicio
             FROM citas c
             INNER JOIN barberos b ON b.id = c.barbero_id
             INNER JOIN servicios s ON s.id = c.servicio_id
             WHERE c.cliente_id = ?
             ORDER BY c.fecha DESC, c.hora_inicio ASC`,
            [clienteId]
        );

        res.json({ cliente_id: clienteId, total_citas: citas.length, citas });

    } catch (error) {
        console.error("❌ Error al obtener mis citas:", error);
        res.status(500).json({ error: "Error al obtener tus citas" });
    }
};

export const getPerfil = async (req, res) => {
    try {
        const clienteId = req.usuario.id;

        const [rows] = await db.query(
            "SELECT id, nombre, email, puntos, rol FROM clientes WHERE id = ?",
            [clienteId]
        );

        if (rows.length === 0) return res.status(404).json({ error: "Cliente no encontrado" });

        res.json(rows[0]);
    } catch (error) {
        console.error("❌ Error al obtener perfil:", error);
        res.status(500).json({ error: "Error al obtener perfil" });
    }
};

export const getMisPuntos = async (req, res) => {
    try {
        const clienteId = req.usuario.id;

        const [rows] = await db.query(
            "SELECT puntos FROM clientes WHERE id = ?",
            [clienteId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        res.json({ puntos: rows[0].puntos ?? 0 });
    } catch (error) {
        console.error("❌ Error al obtener puntos:", error);
        res.status(500).json({ error: "Error al obtener puntos" });
    }
};

export const getMiHistorial = async (req, res) => {
    try {
        const clienteId = req.usuario.id;

        const [citas] = await db.query(
            `SELECT 
                c.id, c.fecha, c.hora_inicio, c.hora_fin, c.estado,
                b.nombre AS barbero,
                s.nombre AS servicio
             FROM citas c
             INNER JOIN barberos b ON b.id = c.barbero_id
             INNER JOIN servicios s ON s.id = c.servicio_id
             WHERE c.cliente_id = ?
             AND c.estado IN ('completada', 'cancelada')
             ORDER BY c.fecha DESC, c.hora_inicio ASC`,
            [clienteId]
        );

        res.json({ cliente_id: clienteId, total_registros: citas.length, citas });

    } catch (error) {
        console.error("❌ Error al obtener historial:", error);
        res.status(500).json({ error: "Error al obtener historial" });
    }
};
