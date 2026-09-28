USE control_medicamentos;

-- Ejecutar una sola vez si la base fue creada con una versión anterior.
-- Estas sentencias no usan ADD COLUMN IF NOT EXISTS para mantener
-- compatibilidad con versiones antiguas de MySQL y MariaDB.

ALTER TABLE usuarios
  ADD COLUMN password_hash VARCHAR(255) NULL AFTER id_rol;

ALTER TABLE usuarios
  ADD COLUMN estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER password_hash;

ALTER TABLE medicamentos
  ADD COLUMN estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER descripcion;

ALTER TABLE inventario
  ADD COLUMN estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER ubicacion;

ALTER TABLE alertas
  ADD COLUMN estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER fecha_alerta;

-- Hash bcrypt de Password123! para los usuarios antiguos sin contraseña.
UPDATE usuarios
SET password_hash = '$2b$12$HDvdkSEggyGOdR42Lr3pEOBO77i/v.kSs8KrFUdLHVGfJHZVxCa8y'
WHERE password_hash IS NULL OR password_hash = '';

UPDATE usuarios SET estado = 'activo' WHERE estado IS NULL OR estado = '';
UPDATE medicamentos SET estado = 'activo' WHERE estado IS NULL OR estado = '';
UPDATE inventario SET estado = 'activo' WHERE estado IS NULL OR estado = '';
UPDATE alertas SET estado = 'activo' WHERE estado IS NULL OR estado = '';

ALTER TABLE usuarios MODIFY password_hash VARCHAR(255) NOT NULL;

CREATE TABLE IF NOT EXISTS lotes (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- La aplicación usa PATCH para desactivar y no expone DELETE físico.
