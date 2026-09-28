const express = require("express");
const router = express.Router();
const db = require("../db");

// GET: solo medicamentos activos
router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM medicamentos WHERE estado = ? ORDER BY id_medicamento DESC",
    ["activo"],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error al obtener medicamentos" });
      res.json(result);
    },
  );
});

// POST: crear medicamento como activo
router.post("/", (req, res) => {
  const { id_usuario, nombre, descripcion } = req.body;
  if (!nombre || !String(nombre).trim())
    return res.status(400).json({ message: "El nombre es obligatorio" });
  const sql =
    "INSERT INTO medicamentos (id_usuario, nombre, descripcion, estado) VALUES (?, ?, ?, ?)";
  db.query(
    sql,
    [id_usuario || 1, nombre.trim(), descripcion || null, "activo"],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error al agregar medicamento" });
      res
        .status(201)
        .json({ message: "Medicamento agregado", id: result.insertId });
    },
  );
});

// PATCH: desactivar sin borrar físicamente
router.patch("/:id/desactivar", (req, res) => {
  db.query(
    "UPDATE medicamentos SET estado = ? WHERE id_medicamento = ? AND estado = ?",
    ["inactivo", req.params.id, "activo"],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error al desactivar medicamento" });
      if (!result.affectedRows)
        return res
          .status(404)
          .json({ message: "Medicamento no encontrado o ya está inactivo" });
      res.json({ message: "Medicamento desactivado correctamente" });
    },
  );
});

module.exports = router;

// No se implementa DELETE: la trazabilidad se conserva mediante estado.
