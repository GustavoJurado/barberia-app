// -----------------------------------------
// ARCHIVO DE CONEXIÓN A SINGLESTORE (MySQL compatible)
// -----------------------------------------

import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Cargar variables del archivo .env
dotenv.config();

export const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    ssl: {} // SingleStore requiere conexión SSL aunque sea vacía
});

console.log("📦 Conectado a SingleStore ✔");
export default db;
