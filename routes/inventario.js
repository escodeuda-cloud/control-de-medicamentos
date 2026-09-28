const express = require("express");
const router = express.Router();
const db = require("../db");

// GET: solo registros disponibles
router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM inventario WHERE estado = ? ORDER BY id_inventario DESC",
    ["activo"],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error al obtener inventario" });
      res.json(result);
    },
  );
});

// POST: crear registro como activo
router.post("/", (req, res) => {
  const { id_usuario, cantidad, ubicacion } = req.body;
  const sql =
    "INSERT INTO inventario (id_usuario, cantidad, ubicacion, estado) VALUES (?, ?, ?, ?)";
  db.query(
    sql,
    [id_usuario || 1, cantidad, ubicacion, "activo"],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error al agregar al inventario" });
      res
        .status(201)
        .json({ message: "Inventario actualizado", id: result.insertId });
    },
  );
});

// PATCH: marcar el registro como inactivo
router.patch("/:id/desactivar", (req, res) => {
  db.query(
    "UPDATE inventario SET estado = ? WHERE id_inventario = ? AND estado = ?",
    ["inactivo", req.params.id, "activo"],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error al desactivar registro de inventario" });
      if (!result.affectedRows)
        return res
          .status(404)
          .json({ message: "Registro no encontrado o ya está inactivo" });
      res.json({ message: "Registro de inventario desactivado correctamente" });
    },
  );
});

module.exports = router;

// No se implementa DELETE físico.
