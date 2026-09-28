USE control_medicamentos;

-- Ejecutar una sola vez sobre una base ya creada.
-- Se usa estado para conservar los registros y evitar DELETE físicos.

ALTER TABLE usuarios
  ADD COLUMN estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER id_rol;

ALTER TABLE medicamentos
  ADD COLUMN estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER descripcion;

ALTER TABLE inventario
  ADD COLUMN estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER ubicacion;

ALTER TABLE alertas
  ADD COLUMN estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER fecha_alerta;

UPDATE usuarios SET estado = 'activo' WHERE estado IS NULL OR estado = '';
UPDATE medicamentos SET estado = 'activo' WHERE estado IS NULL OR estado = '';
UPDATE inventario SET estado = 'activo' WHERE estado IS NULL OR estado = '';
UPDATE alertas SET estado = 'activo' WHERE estado IS NULL OR estado = '';

-- Comprobación
SELECT 'usuarios' AS tabla, estado, COUNT(*) AS cantidad FROM usuarios GROUP BY estado
UNION ALL
SELECT 'medicamentos', estado, COUNT(*) FROM medicamentos GROUP BY estado
UNION ALL
SELECT 'inventario', estado, COUNT(*) FROM inventario GROUP BY estado
UNION ALL
SELECT 'alertas', estado, COUNT(*) FROM alertas GROUP BY estado;

-- No se agregan instrucciones DELETE. Los registros inactivos permanecen
-- disponibles para auditoría y trazabilidad histórica.
