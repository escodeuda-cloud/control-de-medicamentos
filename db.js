const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "control_medicamentos",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Hash bcrypt de demostración para usuarios antiguos sin contraseña.
// La contraseña original no se guarda en la base de datos.
const PASSWORD_HASH_DEMO =
  "$2b$12$HDvdkSEggyGOdR42Lr3pEOBO77i/v.kSs8KrFUdLHVGfJHZVxCa8y";

function columnExists(tableName, columnName, callback) {
  const sql = `SELECT COUNT(*) AS total
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?`;
  pool.query(sql, [tableName, columnName], (error, rows) => {
    if (error) return callback(error);
    callback(null, Number(rows[0].total) > 0);
  });
}

// Agrega una columna únicamente si no existe.
// ALTER TABLE se ejecuta únicamente cuando la columna todavía no existe.
function ensureColumn(tableName, columnName, definition, callback) {
  columnExists(tableName, columnName, (error, exists) => {
    if (error) return callback(error);
    if (exists) return callback(null);
    pool.query(
      `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`,
      callback,
    );
  });
}

function ensureColumns(callback) {
  ensureColumn(
    "usuarios",
    "password_hash",
    "VARCHAR(255) NULL AFTER id_rol",
    (error) => {
      if (error) return callback(error);
      ensureColumn(
        "usuarios",
        "estado",
        "ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER password_hash",
        (error2) => {
          if (error2) return callback(error2);
          ensureColumn(
            "medicamentos",
            "estado",
            "ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER descripcion",
            (error3) => {
              if (error3) return callback(error3);
              ensureColumn(
                "inventario",
                "estado",
                "ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER ubicacion",
                (error4) => {
                  if (error4) return callback(error4);
                  ensureColumn(
                    "alertas",
                    "estado",
                    "ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER fecha_alerta",
                    callback,
                  );
                },
              );
            },
          );
        },
      );
    },
  );
}

function updateLegacyData(callback) {
  const statements = [
    `UPDATE usuarios SET password_hash = '${PASSWORD_HASH_DEMO}' WHERE password_hash IS NULL OR password_hash = ''`,
    "UPDATE usuarios SET estado = 'activo' WHERE estado IS NULL OR estado = ''",
    "UPDATE medicamentos SET estado = 'activo' WHERE estado IS NULL OR estado = ''",
    "UPDATE inventario SET estado = 'activo' WHERE estado IS NULL OR estado = ''",
    "UPDATE alertas SET estado = 'activo' WHERE estado IS NULL OR estado = ''",
    "ALTER TABLE usuarios MODIFY password_hash VARCHAR(255) NOT NULL",
  ];
  let index = 0;
  function next(error) {
    if (error) return callback(error);
    if (index >= statements.length) return callback(null);
    pool.query(statements[index++], next);
  }
  next();
}

function ensureLotesTable(callback) {
  const sql = `CREATE TABLE IF NOT EXISTS lotes (
    id_lote INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_medicamento INT NOT NULL,
    numero_lote VARCHAR(80) NOT NULL,
    cantidad_inicial INT NOT NULL,
    cantidad_disponible INT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_caducidad DATE NOT NULL,
    ubicacion VARCHAR(100) NULL,
    estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',
    PRIMARY KEY (id_lote),
    KEY idx_lotes_fefo (estado, cantidad_disponible, fecha_caducidad)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
  pool.query(sql, (error) => {
    if (error) return callback(error);
    // Compatibilidad con bases creadas antes de agregar el módulo FEFO.
    ensureColumn(
      "lotes",
      "cantidad_disponible",
      "INT NOT NULL DEFAULT 0",
      (error2) => {
        if (error2) return callback(error2);
        ensureColumn(
          "lotes",
          "estado",
          "ENUM('activo','inactivo') NOT NULL DEFAULT 'activo'",
          callback,
        );
      },
    );
  });
}

// Prepara una base nueva o actualiza una base antigua sin borrar datos.
function initializeSchema(callback) {
  ensureColumns((error) => {
    if (error) return callback(error);
    updateLegacyData((error2) => {
      if (error2) return callback(error2);
      ensureLotesTable(callback);
    });
  });
}

module.exports = pool;
module.exports.initializeSchema = initializeSchema;
