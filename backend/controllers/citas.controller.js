// ------------------------------------------------------
// CONTROLADOR DE CITAS
// ------------------------------------------------------

import { db } from "../db.js";

// ------------------------------------------------------
// Helper: sumar minutos a una hora "HH:MM:SS"
// ------------------------------------------------------
function sumarMinutos(hora, minutos) {
    const [h, m, s] = hora.split(":").map(Number);
    const base = new Date();
    base.setHours(h, m + minutos, s || 0, 0);
    const hh = String(base.getHours()).padStart(2, "0");
    const mm = String(base.getMinutes()).padStart(2, "0");
    const ss = String(base.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
}

// ------------------------------------------------------
// GET -> Obtener citas (filtros opcionales: fecha, barbero_id)
// ------------------------------------------------------
export const getCitas = async (req, res) => {
    try {
        const { fecha, barbero_id } = req.query;

        let sql = `
            SELECT c.id, c.fecha, c.hora_inicio, c.hora_fin, c.estado,
                   cli.nombre AS cliente,
                   b.nombre   AS barbero,
                   s.nombre   AS servicio
            FROM citas c
            INNER JOIN clientes  cli ON cli.id = c.cliente_id
            INNER JOIN barberos  b   ON b.id   = c.barbero_id
            INNER JOIN servicios s   ON s.id   = c.servicio_id
            WHERE 1 = 1
        `;
        const params = [];

        if (fecha) {
            sql += " AND c.fecha = ?";
            params.push(fecha);
        }

        if (barbero_id) {
            sql += " AND c.barbero_id = ?";
            params.push(barbero_id);
        }

        sql += " ORDER BY c.fecha DESC, c.hora_inicio ASC";

        const [rows] = await db.query(sql, params);
        return res.json(rows);

    } catch (error) {
        console.error("❌ Error al obtener citas:", error);
        return res.status(500).json({ error: "Error al obtener citas" });
    }
};

// ------------------------------------------------------
// GET -> Disponibilidad por fecha y barbero
// ------------------------------------------------------
export const getDisponibilidad = async (req, res) => {
    try {
        const { fecha, barbero_id } = req.query;

        if (!fecha || !barbero_id) {
            return res.status(400).json({ error: "Debes enviar fecha y barbero_id" });
        }

        const [citas] = await db.query(
            `SELECT hora_inicio, hora_fin
             FROM citas
             WHERE fecha = ? AND barbero_id = ?
             ORDER BY hora_inicio ASC`,
            [fecha, barbero_id]
        );

        const apertura = 8 * 60;   // 08:00
        const cierre   = 22 * 60;  // 22:00

        const minutosOcupados = new Set();

        citas.forEach(c => {
            const [h1, m1] = c.hora_inicio.split(":").map(Number);
            const [h2, m2] = c.hora_fin.split(":").map(Number);
            const ini = h1 * 60 + m1;
            const fin = h2 * 60 + m2;
            for (let t = ini; t < fin; t++) {
                minutosOcupados.add(t);
            }
        });

        const disponibles = [];
        for (let t = apertura; t < cierre; t += 5) {
            if (!minutosOcupados.has(t)) {
                const hh = String(Math.floor(t / 60)).padStart(2, "0");
                const mm = String(t % 60).padStart(2, "0");
                disponibles.push(`${hh}:${mm}`);
            }
        }

        return res.json({
            fecha,
            barbero_id,
            horas_disponibles: disponibles
        });

    } catch (error) {
        console.error("❌ Error disponibilidad:", error);
        return res.status(500).json({ error: "Error al obtener disponibilidad" });
    }
};

// ------------------------------------------------------
// POST -> Crear cita
// - Cliente logueado: usa id del token
// - Admin: puede mandar cliente_id en el body
// ------------------------------------------------------
export const crearCita = async (req, res) => {
    try {
        let { cliente_id, barbero_id, servicio_id, fecha, hora_inicio } = req.body;

        // Si es cliente, su id viene del token
        if (req.usuario?.rol === "cliente") {
            cliente_id = req.usuario.id;
        }

        if (!cliente_id || !barbero_id || !servicio_id || !fecha || !hora_inicio) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        // Servicio -> duración
        const [servicioRows] = await db.query(
            "SELECT duracion_minutos FROM servicios WHERE id = ?",
            [servicio_id]
        );
        if (servicioRows.length === 0) {
            return res.status(400).json({ error: "El servicio no existe" });
        }
        const duracion = servicioRows[0].duracion_minutos;

        // Calcular hora_fin
        const hora_fin = sumarMinutos(hora_inicio, duracion);

        // Validar horario laboral
        if (hora_inicio < "08:00:00") {
            return res.status(400).json({ error: "No puedes agendar antes de las 08:00" });
        }
        if (hora_fin > "22:00:00") {
            return res.status(400).json({ error: "La cita debe terminar antes de las 22:00" });
        }

        // No permitir en el pasado
        const fechaHora = new Date(`${fecha}T${hora_inicio}`);
        if (fechaHora < new Date()) {
            return res.status(400).json({ error: "No puedes reservar en el pasado" });
        }

        // Validar cruce de horarios para el barbero
        const [choque] = await db.query(
            `SELECT id FROM citas
             WHERE barbero_id = ? AND fecha = ?
             AND (
                (hora_inicio < ? AND hora_fin > ?) OR
                (hora_inicio >= ? AND hora_inicio < ?) OR
                (hora_fin > ? AND hora_fin <= ?) OR
                (hora_inicio <= ? AND hora_fin >= ?)
             )`,
            [
                barbero_id, fecha,
                hora_fin, hora_inicio,
                hora_inicio, hora_fin,
                hora_inicio, hora_fin,
                hora_inicio, hora_fin
            ]
        );

        if (choque.length > 0) {
            return res.status(400).json({ error: "El barbero ya tiene una cita en ese horario" });
        }

        await db.query(
            `INSERT INTO citas (cliente_id, barbero_id, servicio_id, fecha, hora_inicio, hora_fin, estado)
             VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
            [cliente_id, barbero_id, servicio_id, fecha, hora_inicio, hora_fin]
        );

        return res.json({
            message: "Cita creada correctamente",
            hora_fin
        });

    } catch (error) {
        console.error("❌ Error al crear cita:", error);
        return res.status(500).json({ error: "Error al crear cita" });
    }
};

// ------------------------------------------------------
// PUT -> Actualizar cita
// 2 modos:
//   A) Solo cambiar estado: body = { estado }
//   B) Editar todo: body con cliente_id, barbero_id, servicio_id, fecha, hora_inicio, estado
// ------------------------------------------------------
export const actualizarCita = async (req, res) => {
    const { id } = req.params;
    const {
        cliente_id,
        barbero_id,
        servicio_id,
        fecha,
        hora_inicio,
        estado
    } = req.body;

    try {
        // -------------------------------
        // MODO A: solo actualizar estado
        // -------------------------------
        const editandoSoloEstado =
            !cliente_id && !barbero_id && !servicio_id && !fecha && !hora_inicio && estado;

        if (editandoSoloEstado) {
            // Traer la cita actual
            const [rows] = await db.query("SELECT * FROM citas WHERE id = ?", [id]);
            if (rows.length === 0) {
                return res.status(404).json({ error: "Cita no encontrada" });
            }
            const cita = rows[0];

            // Actualizar estado
            await db.query(
                "UPDATE citas SET estado = ? WHERE id = ?",
                [estado, id]
            );

            // Sistema de puntos (solo cuando pasa a completada)
            let respuestaPuntos = {};
            if (estado === "completada") {
                const [cliRows] = await db.query(
                    "SELECT puntos FROM clientes WHERE id = ?",
                    [cita.cliente_id]
                );
                if (cliRows.length > 0) {
                    let puntos = cliRows[0].puntos + 1;
                    if (puntos >= 6) {
                        await db.query(
                            "UPDATE clientes SET puntos = 0 WHERE id = ?",
                            [cita.cliente_id]
                        );
                        respuestaPuntos = {
                            puntos: 0,
                            premio: "🎁 ¡Has ganado un corte GRATIS! Tus puntos se han reiniciado."
                        };
                    } else {
                        await db.query(
                            "UPDATE clientes SET puntos = ? WHERE id = ?",
                            [puntos, cita.cliente_id]
                        );
                        respuestaPuntos = {
                            puntos,
                            progreso: `Te faltan ${6 - puntos} puntos para un corte gratis`
                        };
                    }
                }
            }

            return res.json({
                message: "Cita actualizada",
                ...respuestaPuntos
            });
        }

        // -------------------------------
        // MODO B: editar toda la cita
        // -------------------------------
        if (!cliente_id || !barbero_id || !servicio_id || !fecha || !hora_inicio) {
            return res.status(400).json({ error: "Faltan datos obligatorios para editar la cita" });
        }

        // Calcular nueva hora_fin según servicio
        const [servicioRows] = await db.query(
            "SELECT duracion_minutos FROM servicios WHERE id = ?",
            [servicio_id]
        );
        if (servicioRows.length === 0) {
            return res.status(400).json({ error: "El servicio no existe" });
        }
        const duracion = servicioRows[0].duracion_minutos;
        const hora_fin = sumarMinutos(hora_inicio, duracion);

        if (hora_inicio < "08:00:00")
            return res.status(400).json({ error: "Antes de las 08:00 no se trabaja" });
        if (hora_fin > "22:00:00")
            return res.status(400).json({ error: "La cita debe terminar antes de las 22:00" });

        const fechaHora = new Date(`${fecha}T${hora_inicio}`);
        if (fechaHora < new Date())
            return res.status(400).json({ error: "No puedes mover la cita al pasado" });

        // Evitar cruce con otras citas
        const [choque] = await db.query(
            `SELECT id FROM citas
             WHERE barbero_id = ?
               AND fecha = ?
               AND id <> ?
               AND (
                    (hora_inicio < ? AND hora_fin > ?) OR
                    (hora_inicio >= ? AND hora_inicio < ?) OR
                    (hora_fin > ? AND hora_fin <= ?) OR
                    (hora_inicio <= ? AND hora_fin >= ?)
               )`,
            [
                barbero_id, fecha, id,
                hora_fin, hora_inicio,
                hora_inicio, hora_fin,
                hora_inicio, hora_fin,
                hora_inicio, hora_fin
            ]
        );

        if (choque.length > 0) {
            return res.status(400).json({ error: "Ese horario ya está ocupado" });
        }

        await db.query(
            `UPDATE citas
             SET cliente_id=?, barbero_id=?, servicio_id=?, fecha=?, hora_inicio=?, hora_fin=?, estado=?
             WHERE id=?`,
            [cliente_id, barbero_id, servicio_id, fecha, hora_inicio, hora_fin, estado || "pendiente", id]
        );

        return res.json({
            message: "Cita actualizada correctamente",
            hora_fin
        });

    } catch (error) {
        console.error("❌ Error al actualizar cita:", error);
        return res.status(500).json({ error: "Error al actualizar cita" });
    }
};

// ------------------------------------------------------
// DELETE -> Eliminar cita
// ------------------------------------------------------
export const eliminarCita = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM citas WHERE id = ?", [id]);
        return res.json({ message: "Cita eliminada" });
    } catch (error) {
        console.error("❌ Error al eliminar cita:", error);
        return res.status(500).json({ error: "Error al eliminar cita" });
    }
};
