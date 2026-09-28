const express = require("express");
const router = express.Router();
const db = require("../db");

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function validateLote(body) {
  const cantidad = Number(body.cantidad_inicial);
  if (!Number.isInteger(cantidad) || cantidad <= 0)
    return "La cantidad debe ser un entero mayor que cero";
  if (
    !body.id_medicamento ||
    !body.numero_lote ||
    !validDate(body.fecha_ingreso) ||
    !validDate(body.fecha_caducidad)
  )
    return "Medicamento, lote y fechas son obligatorios";
  if (
    new Date(`${body.fecha_caducidad}T00:00:00`) <
    new Date(`${body.fecha_ingreso}T00:00:00`)
  )
    return "La caducidad no puede ser anterior al ingreso";
  return null;
}

const baseSelect = `SELECT l.*, m.nombre AS medicamento_nombre
  FROM lotes l
  JOIN medicamentos m ON m.id_medicamento = l.id_medicamento`;

// GET /api/lotes: FEFO activo, ordenado por caducidad.
router.get("/", (req, res) => {
  const sql = `${baseSelect}
    WHERE l.estado = 'activo' AND m.estado = 'activo' AND l.cantidad_disponible > 0
    ORDER BY l.fecha_caducidad ASC, l.id_lote ASC`;
  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error al obtener lotes FEFO" });
    res.json(result);
  });
});

// GET /api/lotes/buscar?q=...&dias=30|60|90
router.get("/buscar", (req, res) => {
  const q = String(req.query.q || "").trim();
  const dias = [30, 60, 90].includes(Number(req.query.dias))
    ? Number(req.query.dias)
    : 90;
  const like = `%${q}%`;
  const sql = `${baseSelect}
    WHERE l.estado = 'activo' AND m.estado = 'activo'
      AND l.cantidad_disponible > 0
      AND l.fecha_caducidad >= CURDATE()
      AND l.fecha_caducidad <= DATE_ADD(CURDATE(), INTERVAL ${dias} DAY)
      AND (m.nombre LIKE ? OR l.numero_lote LIKE ?)
    ORDER BY l.fecha_caducidad ASC, l.id_lote ASC`;
  db.query(sql, [like, like], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error al buscar lotes FEFO" });
    res.json(result);
  });
});

// GET /api/lotes/reporte: resumen FEFO, inventario crítico y caducados.
router.get("/reporte", (req, res) => {
  const critical = Number(req.query.critico || 10);
  const criticalLimit =
    Number.isInteger(critical) && critical >= 0 ? critical : 10;
  const activeSql = `${baseSelect}
    WHERE l.estado = 'activo' AND m.estado = 'activo'
    ORDER BY l.fecha_caducidad ASC, l.id_lote ASC`;
  const criticalSql = `${baseSelect}
    WHERE l.estado = 'activo' AND m.estado = 'activo' AND l.cantidad_disponible > 0 AND l.cantidad_disponible <= ?
    ORDER BY l.cantidad_disponible ASC, l.fecha_caducidad ASC`;
  const expiredSql = `${baseSelect}
    WHERE l.estado = 'activo' AND m.estado = 'activo' AND l.fecha_caducidad < CURDATE()
    ORDER BY l.fecha_caducidad ASC`;
  db.query(activeSql, (err, fefo) => {
    if (err)
      return res.status(500).json({ message: "Error al generar reporte FEFO" });
    db.query(criticalSql, [criticalLimit], (err2, criticos) => {
      if (err2)
        return res
          .status(500)
          .json({ message: "Error al obtener inventario crítico" });
      db.query(expiredSql, (err3, caducados) => {
        if (err3)
          return res
            .status(500)
            .json({ message: "Error al obtener productos caducados" });
        res.json({
          generado_en: new Date().toISOString(),
          limite_critico: criticalLimit,
          fefo,
          criticos,
          caducados,
        });
      });
    });
  });
});

// POST: registra la entrada física de un lote.
router.post("/", (req, res) => {
  const error = validateLote(req.body);
  if (error) return res.status(400).json({ message: error });
  const {
    id_usuario,
    id_medicamento,
    numero_lote,
    cantidad_inicial,
    fecha_ingreso,
    fecha_caducidad,
    ubicacion,
  } = req.body;
  const cantidad = Number(cantidad_inicial);
  const insert = `INSERT INTO lotes
    (id_usuario, id_medicamento, numero_lote, cantidad_inicial, cantidad_disponible, fecha_ingreso, fecha_caducidad, ubicacion, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activo')`;
  db.query(
    insert,
    [
      id_usuario || 1,
      id_medicamento,
      String(numero_lote).trim(),
      cantidad,
      cantidad,
      fecha_ingreso,
      fecha_caducidad,
      ubicacion || null,
    ],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error al registrar la entrada del lote" });
      createExpiryAlert(id_usuario || 1, numero_lote, fecha_caducidad);
      res
        .status(201)
        .json({ message: "Entrada de lote registrada", id: result.insertId });
    },
  );
});

// PUT: actualiza los datos del lote y conserva la cantidad disponible existente.
router.put("/:id", (req, res) => {
  const error = validateLote(req.body);
  if (error) return res.status(400).json({ message: error });
  const {
    id_medicamento,
    numero_lote,
    cantidad_inicial,
    fecha_ingreso,
    fecha_caducidad,
    ubicacion,
  } = req.body;
  const cantidad = Number(cantidad_inicial);
  const sql = `UPDATE lotes
    SET id_medicamento = ?, numero_lote = ?, cantidad_inicial = ?,
        cantidad_disponible = LEAST(cantidad_disponible, ?),
        fecha_ingreso = ?, fecha_caducidad = ?, ubicacion = ?
    WHERE id_lote = ? AND estado = 'activo'`;
  db.query(
    sql,
    [
      id_medicamento,
      String(numero_lote).trim(),
      cantidad,
      cantidad,
      fecha_ingreso,
      fecha_caducidad,
      ubicacion || null,
      req.params.id,
    ],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error al actualizar lote" });
      if (!result.affectedRows)
        return res
          .status(404)
          .json({ message: "Lote no encontrado o ya está inactivo" });
      createExpiryAlert(req.body.id_usuario || 1, numero_lote, fecha_caducidad);
      res.json({ message: "Lote actualizado correctamente" });
    },
  );
});

function createExpiryAlert(idUsuario, numeroLote, fechaCaducidad) {
  const days = Math.ceil(
    (new Date(`${fechaCaducidad}T00:00:00`) - new Date()) / 86400000,
  );
  if (days <= 30) {
    const alertSql = `INSERT INTO alertas (id_usuario, tipo_alerta, fecha_alerta, estado)
      VALUES (?, ?, NOW(), 'activo')`;
    db.query(
      alertSql,
      [idUsuario, `Caducidad próxima: lote ${numeroLote} (${days} días)`],
      () => {},
    );
  }
}

router.patch("/:id/desactivar", (req, res) => {
  db.query(
    "UPDATE lotes SET estado = 'inactivo' WHERE id_lote = ? AND estado = 'activo'",
    [req.params.id],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error al desactivar lote" });
      if (!result.affectedRows)
        return res
          .status(404)
          .json({ message: "Lote no encontrado o ya está inactivo" });
      res.json({ message: "Lote desactivado correctamente" });
    },
  );
});

module.exports = router;
