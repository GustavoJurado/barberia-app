// ------------------------------------------------------
// RUTAS: URLs que el frontend o Postman pueden llamar
// ------------------------------------------------------

import express from "express";
import { 
    getClientes, 
    crearCliente, 
    actualizarCliente, 
    eliminarCliente,
    getMisCitas,
    getPerfil,
    getMisPuntos,
    getMiHistorial
} from "../controllers/clientes.controller.js";

import { verificarToken, verificarRol } from "../middlewares/auth.js";

const router = express.Router();

// ------------------------------------------------------
// GET -> Obtener todos los clientes (ADMIN)
// http://localhost:3000/clientes
// ------------------------------------------------------
router.get("/", verificarToken, verificarRol("admin"), getClientes);

// ------------------------------------------------------
// GET -> Obtener mis citas (cliente logueado)
// http://localhost:3000/clientes/mis-citas
// ------------------------------------------------------
router.get("/mis-citas", verificarToken, getMisCitas);

// ------------------------------------------------------
// GET -> Perfil del cliente logueado
// http://localhost:3000/clientes/perfil
// ------------------------------------------------------
router.get("/perfil", verificarToken, getPerfil);

// ------------------------------------------------------
// GET -> Mis puntos actuales
// http://localhost:3000/clientes/mis-puntos
// ------------------------------------------------------
router.get("/mis-puntos", verificarToken, getMisPuntos);

// ------------------------------------------------------
// GET -> Mi historial (canceladas + completadas)
// http://localhost:3000/clientes/mis-historial
// ------------------------------------------------------
router.get("/mis-historial", verificarToken, getMiHistorial);

// ------------------------------------------------------
// POST -> Crear un cliente (solo admin)
// http://localhost:3000/clientes
// ------------------------------------------------------
router.post("/", verificarToken, verificarRol("admin"), crearCliente);

// ------------------------------------------------------
// PUT -> Actualizar cliente (solo admin)
// Permite actualizar nombre, email, puntos y contraseña.
// El controlador ya maneja los campos opcionales.
// http://localhost:3000/clientes/:id
// ------------------------------------------------------
router.put("/:id", verificarToken, verificarRol("admin"), actualizarCliente);

// ------------------------------------------------------
// DELETE -> Eliminar cliente (solo admin)
// http://localhost:3000/clientes/:id
// ------------------------------------------------------
router.delete("/:id", verificarToken, verificarRol("admin"), eliminarCliente);

// ------------------------------------------------------
export default router;
