// ------------------------------------------------------
// CONTROLADOR DE AUTENTICACIÓN (Login, Registro, Logout, Recuperación)
// ------------------------------------------------------

import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = "super_secreto_barberia"; // <-- pásalo a env después


// ------------------------------------------------------
// POST -> Registrar usuario
// ------------------------------------------------------
export const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        const [existe] = await db.query(
            "SELECT id FROM clientes WHERE email = ?",
            [email]
        );

        if (existe.length > 0) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const rolFinal = rol || "cliente";

        const [resultado] = await db.query(
            "INSERT INTO clientes (nombre, email, password, puntos, rol) VALUES (?, ?, ?, 0, ?)",
            [nombre, email, passwordHash, rolFinal]
        );

        return res.json({
            message: "Usuario registrado correctamente",
            id: resultado.insertId,
            nombre,
            email,
            rol: rolFinal
        });

    } catch (error) {
        console.error("❌ Error al registrar usuario:", error);
        return res.status(500).json({ error: "Error al registrar usuario" });
    }
};



// ------------------------------------------------------
// POST -> Login
// ------------------------------------------------------
export const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        const [rows] = await db.query(
            "SELECT * FROM clientes WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: "Correo o contraseña incorrectos" });
        }

        const usuario = rows[0];
        const match = await bcrypt.compare(password, usuario.password);

        if (!match) {
            return res.status(400).json({ error: "Correo o contraseña incorrectos" });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            },
            SECRET,
            { expiresIn: "7d" }
        );

        return res.json({
            message: "Login correcto",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                puntos: usuario.puntos,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error("❌ Error al iniciar sesión:", error);
        return res.status(500).json({ error: "Error al iniciar sesión" });
    }
};



// ======================================================================
// RECUPERAR CONTRASEÑA — SOLO CLIENTES
// ======================================================================

// ------------------------------------------------------
// POST -> Solicitar código de recuperación
// ------------------------------------------------------
export const solicitarCodigoRecuperacion = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ error: "Correo requerido" });

        const [rows] = await db.query(
            "SELECT id FROM clientes WHERE email = ? AND rol = 'cliente'",
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: "No existe un cliente con ese correo" });
        }

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        await db.query(
            "UPDATE clientes SET reset_code = ? WHERE email = ?",
            [codigo, email]
        );

        return res.json({
            message: "Código generado correctamente",
            codigo   // por ahora lo devolvemos
        });

    } catch (error) {
        console.error("❌ Error al generar código:", error);
        return res.status(500).json({ error: "Error al generar código" });
    }
};



// ------------------------------------------------------
// POST -> Resetear contraseña
// ------------------------------------------------------
export const resetearPassword = async (req, res) => {
    try {
        const { email, codigo, nuevaPassword } = req.body;

        if (!email || !codigo || !nuevaPassword) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        const [rows] = await db.query(
            "SELECT id, reset_code FROM clientes WHERE email = ? AND rol = 'cliente'",
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: "Correo inválido" });
        }

        const cliente = rows[0];

        if (cliente.reset_code !== codigo) {
            return res.status(400).json({ error: "Código incorrecto" });
        }

        const passwordHash = await bcrypt.hash(nuevaPassword, 10);

        await db.query(
            "UPDATE clientes SET password = ?, reset_code = NULL WHERE email = ?",
            [passwordHash, email]
        );

        return res.json({ message: "Contraseña actualizada correctamente" });

    } catch (error) {
        console.error("❌ Error al restablecer contraseña:", error);
        return res.status(500).json({ error: "Error al restablecer contraseña" });
    }
};




// ------------------------------------------------------
// LOGOUT
// ------------------------------------------------------
export const logoutUsuario = async (req, res) => {
    return res.json({ message: "Logout correcto. Elimina el token en el frontend." });
};
