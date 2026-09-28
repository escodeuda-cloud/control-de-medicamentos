const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function publicUser(user) {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

// GET: únicamente usuarios activos y nunca devuelve el hash.
router.get("/", (req, res) => {
  const sql = `SELECT u.id_usuario, u.nombre, u.email, u.id_rol,
      u.estado, r.nombre AS nombre_rol
    FROM usuarios u
    JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.estado = 'activo'
    ORDER BY u.id_usuario DESC`;
  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error al obtener usuarios" });
    res.json(result);
  });
});

// POST /login: valida la contraseña contra el hash almacenado.
router.post("/login", (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "");
  if (!EMAIL_RE.test(email) || !password) {
    return res
      .status(400)
      .json({ message: "Correo y contraseña son obligatorios" });
  }

  const sql = `SELECT u.*, r.nombre AS nombre_rol
    FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
    WHERE LOWER(u.email) = ? AND u.estado = 'activo' LIMIT 1`;
  db.query(sql, [email], async (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error al validar el usuario" });
    if (!result.length)
      return res
        .status(401)
        .json({ message: "Correo o contraseña incorrectos" });

    const user = result[0];
    try {
      const valid = await bcrypt.compare(password, user.password_hash || "");
      if (!valid)
        return res
          .status(401)
          .json({ message: "Correo o contraseña incorrectos" });
      res.json(publicUser(user));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al comprobar la contraseña" });
    }
  });
});

// POST: registra el usuario guardando únicamente un hash bcrypt.
router.post("/", async (req, res) => {
  const nombre = String(req.body.nombre || "").trim();
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "");
  const id_rol = Number(req.body.id_rol) || 2;

  if (nombre.length < 2)
    return res
      .status(400)
      .json({ message: "El nombre debe tener al menos 2 caracteres" });
  if (!EMAIL_RE.test(email))
    return res
      .status(400)
      .json({ message: "El correo no tiene un formato válido" });
  if (password.length < MIN_PASSWORD_LENGTH)
    return res
      .status(400)
      .json({ message: "La contraseña debe tener mínimo 8 caracteres" });

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const sql = `INSERT INTO usuarios (nombre, email, id_rol, password_hash, estado)
      VALUES (?, ?, ?, ?, 'activo')`;
    db.query(sql, [nombre, email, id_rol, passwordHash], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res
            .status(409)
            .json({ message: "El correo ya está registrado" });
        console.error(err);
        return res.status(500).json({ message: "Error al registrar usuario" });
      }
      res.status(201).json({
        message: "Usuario registrado",
        id: result.insertId,
        nombre,
        email,
        id_rol,
        estado: "activo",
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al proteger la contraseña" });
  }
});

// PUT: actualiza datos; si llega una contraseña nueva, también se vuelve a hashear.
router.put("/:id", async (req, res) => {
  const nombre = String(req.body.nombre || "").trim();
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "");
  const id_rol = req.body.id_rol === undefined ? null : Number(req.body.id_rol);
  if (nombre.length < 2 || !EMAIL_RE.test(email))
    return res.status(400).json({ message: "Nombre o correo inválido" });

  try {
    let sql = `UPDATE usuarios SET nombre = ?, email = ?, id_rol = COALESCE(?, id_rol)`;
    const values = [nombre, email, id_rol];
    if (password) {
      if (password.length < MIN_PASSWORD_LENGTH)
        return res
          .status(400)
          .json({ message: "La contraseña debe tener mínimo 8 caracteres" });
      sql += ", password_hash = ?";
      values.push(await bcrypt.hash(password, 12));
    }
    sql += " WHERE id_usuario = ? AND estado = 'activo'";
    values.push(req.params.id);
    db.query(sql, values, (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error al actualizar usuario" });
      if (!result.affectedRows)
        return res.status(404).json({ message: "Usuario no encontrado" });
      res.json({ message: "Usuario actualizado" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la contraseña" });
  }
});

// PATCH: desactivación lógica, sin DELETE físico.
router.patch("/:id/desactivar", (req, res) => {
  const sql =
    "UPDATE usuarios SET estado = 'inactivo' WHERE id_usuario = ? AND estado = 'activo'";
  db.query(sql, [req.params.id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error al desactivar usuario" });
    if (!result.affectedRows)
      return res
        .status(404)
        .json({ message: "Usuario no encontrado o ya está inactivo" });
    res.json({ message: "Usuario desactivado correctamente" });
  });
});

module.exports = router;
