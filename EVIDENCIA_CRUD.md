# Evidencia de entrega: CRUD seguro de Medicamentos Seguros

## Preparación

1. Importar `control_medicamentos.sql` si la base se creará desde cero.
2. Si la base ya existe, ejecutar `migracion_seguridad_borrado_logico.sql` una sola vez.
3. Ejecutar `npm install` y después `node server.js`.
4. Abrir `http://localhost:3000/login.html`.

## Registro y hashing

En `register.html`, registrar un usuario con nombre, correo y una contraseña de mínimo ocho caracteres. La respuesta exitosa debe llevar al panel principal. En MySQL, comprobar que no aparece la contraseña original:

```sql
SELECT id_usuario, nombre, email, password_hash, estado
FROM usuarios
ORDER BY id_usuario DESC;
```

La columna `password_hash` debe contener un valor bcrypt que comienza normalmente con `$2b$12$`. La contraseña no debe aparecer en ninguna columna.

## Crear y leer

Desde el panel, crear un medicamento y completar los campos solicitados. La tabla debe actualizarse después de guardar. Luego comprobar en MySQL:

```sql
SELECT * FROM medicamentos ORDER BY id_medicamento DESC;
```

La fila nueva debe aparecer con `estado = 'activo'`.

## Actualizar perfil

Entrar a `usuario.html`, cambiar nombre o correo y pulsar **Guardar Cambios**. El frontend envía `PUT /api/usuarios/:id`; si se introduce una nueva contraseña, el servidor la hashea con bcrypt antes del `UPDATE`.

## Actualizar

En la sección **Lotes FEFO**, pulsar **Editar** en un lote existente. El formulario debe cargarse con el medicamento mostrado por nombre, número de lote, cantidad, ubicación y fechas. Cambiar uno de los datos y pulsar **Guardar cambios**. La tabla debe reflejar el valor actualizado y en la pestaña de red del navegador se puede evidenciar la petición `PUT /api/lotes/:id`.

En MySQL, comprobar el cambio:

```sql
SELECT id_lote, numero_lote, cantidad_inicial, fecha_caducidad, estado
FROM lotes
ORDER BY id_lote DESC;
```

## Borrado lógico

En la tabla de medicamentos o usuarios, pulsar **Desactivar** y confirmar. La aplicación ejecuta un `PATCH` y la fila deja de aparecer en la consulta activa. La fila permanece en la base de datos:

```sql
SELECT id_medicamento, nombre, estado
FROM medicamentos
ORDER BY id_medicamento DESC;
```

El resultado debe conservar el registro con `estado = 'inactivo'`. Esta es la evidencia de que no se utilizó `DELETE` físico.

## Evidencia visual sugerida

Para un documento o video de uno a dos minutos, mostrar en orden: inicio de sesión, registro de un medicamento, tabla actualizada, consulta de MySQL con el hash bcrypt, actualización de perfil y desactivación lógica con la consulta final donde se vea `estado = 'inactivo'`. No mostrar contraseñas reales ni credenciales personales.
