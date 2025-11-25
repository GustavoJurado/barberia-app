// -----------------------------------------
// ARCHIVO DE CONEXIÓN A MYSQL
// -----------------------------------------

import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Cargar variables del archivo .env
dotenv.config();

// Exportamos la conexión lista para usar
export const db = await mysql.createConnection({
    host: "localhost",           // Servidor local
    user: "root",                // Usuario de MySQL
    password: "barberiaguga",    // Contraseña esta en el block de notas
    database: "barberia"         // Nombre base de datos
});

console.log("📦 Conectado a MySQL ✔");
export default db;
// ---------------------------------------------------------
// Crear modelos y controladores 
// ---------------------------------------------------------