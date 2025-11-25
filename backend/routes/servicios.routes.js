// ------------------------------------------------------
// RUTAS: endpoints que el frontend o Postman pueden usar
// ------------------------------------------------------

import express from "express";
import {
    getServicios,
    crearServicio,
    actualizarServicio,
    eliminarServicio
} from "../controllers/servicios.controller.js";

// Creamos el router
const router = express.Router();

// ------------------------------------------------------
// GET -> Obtener todos los servicios
// http://localhost:3000/servicios
// ------------------------------------------------------
router.get("/", getServicios);

// ------------------------------------------------------
// POST -> Crear un nuevo servicio
// http://localhost:3000/servicios
// Body: { nombre, precio, duracion_minutos }
// ------------------------------------------------------
router.post("/", crearServicio);

// ------------------------------------------------------
// PUT -> Actualizar un servicio
// http://localhost:3000/servicios/:id
// ------------------------------------------------------
router.put("/:id", actualizarServicio);

// ------------------------------------------------------
// DELETE -> Eliminar un servicio
// http://localhost:3000/servicios/:id
// ------------------------------------------------------
router.delete("/:id", eliminarServicio);

// ------------------------------------------------------
// Exportamos el router para usarlo en index.js
// ------------------------------------------------------
export default router;
