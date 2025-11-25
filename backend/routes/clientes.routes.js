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
// ------------------------------------------------------
router.get("/", verificarToken, verificarRol("admin"), getClientes);

// ------------------------------------------------------
// GET -> Obtener mis citas (cliente logueado)
// ------------------------------------------------------
router.get("/mis-citas", verificarToken, getMisCitas);

// ------------------------------------------------------
// GET -> Perfil del cliente logueado
// ------------------------------------------------------
router.get("/perfil", verificarToken, getPerfil);

// ------------------------------------------------------
// GET -> Mis puntos
// ------------------------------------------------------
router.get("/mis-puntos", verificarToken, getMisPuntos);

// ------------------------------------------------------
// GET -> Mi historial (cliente)
// ------------------------------------------------------
router.get("/mis-historial", verificarToken, getMiHistorial);

// ------------------------------------------------------
// POST -> Crear cliente (admin)
// ------------------------------------------------------
router.post("/", verificarToken, verificarRol("admin"), crearCliente);

// ------------------------------------------------------
// PUT -> Actualizar cliente (admin)
// ------------------------------------------------------
router.put("/:id", verificarToken, verificarRol("admin"), actualizarCliente);

// ------------------------------------------------------
// DELETE -> Eliminar cliente (admin)
// ------------------------------------------------------
router.delete("/:id", verificarToken, verificarRol("admin"), eliminarCliente);

// ------------------------------------------------------
export default router;
