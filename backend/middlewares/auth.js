import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// --------------------------------------------
// Verificar Token
// --------------------------------------------
export function verificarToken(req, res, next) {
    const header = req.headers["authorization"];
    if (!header) {
        return res.status(401).json({ error: "Token no enviado" });
    }

    const token = header.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token inválido" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}

// --------------------------------------------
// Verificar ROL (acepta múltiples roles)
// --------------------------------------------
export function verificarRol(...roles) {
    return (req, res, next) => {
        if (!req.usuario || !roles.includes(req.usuario.rol)) {
            return res.status(403).json({ error: "Acceso denegado" });
        }
        next();
    };
}
