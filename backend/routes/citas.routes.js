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

// Obtener citas
router.get("/", getCitas);

// Disponibilidad
router.get("/disponibilidad", getDisponibilidad);

// Crear cita (cliente o admin)
router.post("/", verificarToken, verificarRol("cliente", "admin"), crearCita);

// Actualizar cita
router.put(
    "/:id",
    verificarToken,
    verificarRol("cliente", "barbero", "admin"),
    actualizarCita
);

// Eliminar cita (solo admin)
router.delete("/:id", verificarToken, verificarRol("admin"), eliminarCita);

export default router;
