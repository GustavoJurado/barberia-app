// ------------------------------------------------------
// RUTAS DE AUTENTICACIÓN
// ------------------------------------------------------

import express from "express";
import { 
    registrarUsuario, 
    loginUsuario,
    logoutUsuario,
    solicitarCodigoRecuperacion,
    resetearPassword
} from "../controllers/auth.controller.js";

const router = express.Router();

// Registro
router.post("/register", registrarUsuario);

// Login
router.post("/login", loginUsuario);

// Logout
router.post("/logout", logoutUsuario);

// Recuperar contraseña (solo clientes)
router.post("/forgot-password", solicitarCodigoRecuperacion);

// Resetear contraseña
router.post("/reset-password", resetearPassword);

export default router;
