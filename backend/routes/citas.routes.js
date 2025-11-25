// ------------------------------------------------------
// RUTAS DE CITAS
// ------------------------------------------------------

import express from "express";
import {
    getCitas,
    getDisponibilidad,
    crearCita,
    actualizarCita,
    eliminarCita
} from "../controllers/citas.controller.js";

import { verificarToken, verificarRol } from "../middlewares/auth.js";

const router = express.Router();

// ------------------------------------------------------
// GET -> Obtener citas
// ------------------------------------------------------
router.get("/", getCitas);

// ------------------------------------------------------
// GET -> Disponibilidad por fecha y barbero
// ------------------------------------------------------
router.get("/disponibilidad", getDisponibilidad);

// ------------------------------------------------------
// POST -> Crear cita
// ------------------------------------------------------
router.post("/", verificarToken, verificarRol("cliente", "admin"), crearCita);

// ------------------------------------------------------
// PUT -> Actualizar cita (cliente, barbero o admin)
// El cliente podrá CANCELAR su propia cita
// ------------------------------------------------------
router.put(
    "/:id",
    verificarToken,
    verificarRol("cliente", "barbero", "admin"),
    actualizarCita
);

// ------------------------------------------------------
// DELETE -> Eliminar cita (solo admin)
// ------------------------------------------------------
router.delete("/:id", verificarToken, verificarRol("admin"), eliminarCita);

export default router;
