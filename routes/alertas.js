const express = require("express");
const router = express.Router();
const db = require("../db");

// GET: solo alertas activas
router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM alertas WHERE estado = ? ORDER BY fecha_alerta DESC",
    ["activo"],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error al obtener alertas" });
      res.json(result);
    },
  );
});

// POST: crear alerta como activa
router.post("/", (req, res) => {
  const { id_usuario, tipo_alerta, fecha_alerta } = req.body;
  const sql =
    "INSERT INTO alertas (id_usuario, tipo_alerta, fecha_alerta, estado) VALUES (?, ?, ?, ?)";
  db.query(
    sql,
    [id_usuario || 1, tipo_alerta, fecha_alerta || new Date(), "activo"],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error al agregar alerta" });
      res.status(201).json({ message: "Alerta agregada", id: result.insertId });
    },
  );
});

// PATCH: desactivar la alerta conservando su historial
router.patch("/:id/desactivar", (req, res) => {
  db.query(
    "UPDATE alertas SET estado = ? WHERE id_alerta = ? AND estado = ?",
    ["inactivo", req.params.id, "activo"],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error al desactivar alerta" });
      if (!result.affectedRows)
        return res
          .status(404)
          .json({ message: "Alerta no encontrada o ya está inactiva" });
      res.json({ message: "Alerta desactivada correctamente" });
    },
  );
});

module.exports = router;

// No se implementa DELETE físico.
