// ------------------------------------------------------
// MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN
// ------------------------------------------------------

import jwt from "jsonwebtoken";

const SECRET = "super_secreto_barberia"; // → llévalo a .env después

// ------------------------------------------------------
// MIDDLEWARE -> Verificar Token (rutas protegidas)
// ------------------------------------------------------
export const verificarToken = (req, res, next) => {

    const tokenHeader = req.headers["authorization"];

    if (!tokenHeader) {
        return res.status(401).json({ error: "Token no enviado" });
    }

    // "Bearer TOKEN_AQUI"
    const tokenParts = tokenHeader.split(" ");

    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        return res.status(401).json({ error: "Formato de token inválido" });
    }

    const token = tokenParts[1]; // 🔥 SOLO EL TOKEN

    try {
        const decoded = jwt.verify(token, SECRET);
        req.usuario = decoded; // Guarda { id, email, rol }
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};


// ------------------------------------------------------
// MIDDLEWARE -> Verificar Rol (admin, barbero, cliente)
// ------------------------------------------------------
export const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {

        if (!req.usuario || !req.usuario.rol) {
            return res.status(401).json({ error: "No autorizado" });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ error: "No tienes permisos para esta acción" });
        }

        next();
    };
};
