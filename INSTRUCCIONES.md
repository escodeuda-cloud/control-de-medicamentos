# INSTRUCCIONES DEFINITIVAS - MEDICAMENTOS SEGUROS

Sigue estos pasos exactos para poner en marcha el sistema:

## 1. Preparar la Carpeta
Asegúrate de estar dentro de la carpeta `proyectojavascript` en tu terminal.

## 2. Preparar la base de datos
Si vas a crear la base desde cero, importa `control_medicamentos.sql`.

Si ya tenías una base creada, puedes ejecutar una sola vez `migracion_seguridad_borrado_logico.sql` en MySQL para añadir el campo `estado`, `password_hash` y la tabla `lotes`. Además, el servidor verifica y prepara automáticamente estas columnas al iniciar; de todas formas, la base `control_medicamentos` debe existir y las tablas base deben haber sido importadas.

## 3. Instalar y Ejecutar
```bash
npm install
node server.js
```

Al iniciar, el servidor prepara las columnas necesarias para el login, el registro y el borrado lógico. Si aparece un error de conexión, revisa primero que MySQL esté encendido, que exista `control_medicamentos` y que las credenciales de `db.js` sean correctas.

## 4. Acceder Correctamente
El servidor corre en el puerto **3000**. Abre tu navegador y escribe directamente:

👉 **http://localhost:3000**

(Te llevará automáticamente a la página de inicio de sesión: `http://localhost:3000/login.html`)

---

### Notas Importantes:
*   **Puerto 3000**: Si el puerto 3000 está ocupado por otra aplicación, detén ese proceso antes de iniciar el servidor.
*   **Protocolo HTTP**: Nunca abras los archivos `.html` directamente desde tu explorador de archivos con doble clic. Usa siempre `http://localhost:3000`.
*   **Base de Datos**: Recuerda que tu servidor MySQL debe estar activo y con la base de datos `control_medicamentos` importada.
*   **Lotes FEFO**: En el panel, registra primero los medicamentos y después registra cada entrada física de lote con cantidad, fecha de ingreso y fecha de caducidad. El sistema ordena los lotes por la caducidad más próxima y crea una alerta cuando faltan 30 días o menos.


## 5. Si el login o el registro no funcionan

Asegúrate de estar ejecutando el servidor desde esta misma carpeta y de abrir la página con `http://localhost:3000/login.html`, nunca con `file://`. Al iniciar `node server.js`, debe aparecer el mensaje `SERVIDOR INICIADO CORRECTAMENTE`.

Si la base de datos ya existía antes de esta versión, comprueba en phpMyAdmin que la tabla `usuarios` tenga las columnas `password_hash` y `estado`. Si faltan, importa o ejecuta una sola vez `migracion_seguridad_borrado_logico.sql`. El servidor también intenta crear estas columnas automáticamente, pero la base `control_medicamentos` y las tablas base deben existir.

La comprobación en MySQL es:

```sql
USE control_medicamentos;
SHOW COLUMNS FROM usuarios;
```

Para probar el usuario inicial utiliza `juan@gmail.com` y `Password123!`. Si el registro indica que el correo ya existe, prueba con otro correo o inicia sesión con un usuario activo. Si aparece un error de conexión, revisa `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `DB_PORT`; por defecto se usa `localhost`, `root`, contraseña vacía, `control_medicamentos` y el puerto MySQL `3306`. El puerto web del servidor sigue siendo `3000`.


## 6. Registro de usuarios desde el panel

En la sección **Usuarios** del panel se muestran los campos Nombre, Correo, Contraseña y Rol. La contraseña debe tener mínimo ocho caracteres. Al pulsar **Guardar usuario**, el navegador envía la contraseña por HTTPS en un sistema publicado o mediante conexión local durante las pruebas; el servidor la transforma inmediatamente a un hash bcrypt y únicamente guarda `password_hash` en MySQL. La contraseña nunca aparece en la tabla de usuarios ni se devuelve en las respuestas de la API.
