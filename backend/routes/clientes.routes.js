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

// Clientes (admin)
router.get("/", verificarToken, verificarRol("admin"), getClientes);

// Perfil
router.get("/perfil", verificarToken, getPerfil);

// Mis citas
router.get("/mis-citas", verificarToken, getMisCitas);

// Mis puntos
router.get("/mis-puntos", verificarToken, getMisPuntos);

// Mi Historial
router.get("/mis-historial", verificarToken, getMiHistorial);

// Crear cliente (admin)
router.post("/", verificarToken, verificarRol("admin"), crearCliente);

// Editar cliente
router.put("/:id", verificarToken, verificarRol("admin"), actualizarCliente);

// Eliminar cliente
router.delete("/:id", verificarToken, verificarRol("admin"), eliminarCliente);

export default router;
