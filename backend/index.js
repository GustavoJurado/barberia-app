// ------------------------------------------------------
// ARCHIVO PRINCIPAL DEL BACKEND
// ------------------------------------------------------

import express from "express";
import cors from "cors";
import "./db.js"; // Importa la conexión a MySQL
import clientesRoutes from "./routes/clientes.routes.js";
import barberosRoutes from "./routes/barberos.routes.js";
import serviciosRoutes from "./routes/servicios.routes.js";
import citasRoutes from "./routes/citas.routes.js";
import authRoutes from "./routes/auth.routes.js";


const app = express();

// Middleware para permitir JSON
app.use(express.json());

// CORS permite que el frontend se conecte
app.use(cors());

//------------ Rutas ------------ :D
// Rutas de clientes
app.use("/clientes", clientesRoutes);
// Rutas de barberos
app.use("/barberos", barberosRoutes);
// Rutas de servicios
app.use("/servicios", serviciosRoutes);
// Rutas de citas
app.use("/citas", citasRoutes);
// Rutas de autenticación
app.use("/auth", authRoutes);


// Ruta principal
app.get("/", (req, res) => {
    res.send("Servidor funcionando 🚀");
});


// Iniciar servidor
app.listen(3000, () => {
    console.log("🔥 Servidor corriendo en http://localhost:3000");
});
