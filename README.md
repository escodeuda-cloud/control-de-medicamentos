# Medicamentos Seguros — versión humanizada

Este proyecto mantiene la funcionalidad del sistema original, pero tiene el código con una sangría consistente, bloques separados y comentarios más claros.

## Tecnologías

- Node.js
- Express
- MySQL
- JavaScript
- HTML y CSS
- `mysql2` para la conexión con MySQL
- `bcryptjs` para proteger contraseñas
- Prettier para organizar el formato del código

## Cómo ejecutarlo en Visual Studio Code

1. Abre esta carpeta en Visual Studio Code.
2. Abre una terminal dentro de la carpeta del proyecto.
3. Instala las dependencias:

```bash
npm install
```

4. Enciende MySQL y verifica la configuración de `db.js`.
5. Inicia el servidor:

```bash
npm start
```

6. Abre en el navegador:

```text
http://localhost:3000/login.html
```

## Cómo ordenar el código desde Visual Studio Code

El proyecto incluye los comandos de Prettier:

```bash
npm run format
```

Para revisar el formato sin modificar archivos:

```bash
npm run format:check
```

También puedes instalar la extensión **Prettier - Code formatter** y usar `Shift + Alt + F`.

## Archivos principales

- `principal.html`: panel, formularios, tablas y peticiones al backend.
- `server.js`: crea el servidor Express y conecta las rutas.
- `db.js`: configura la conexión y prepara las tablas necesarias.
- `routes/medicamentos.js`: registra y consulta medicamentos.
- `routes/usuarios.js`: registra, consulta y autentica usuarios.
- `routes/alertas.js`: registra y consulta alertas.
- `routes/inventario.js`: registra y consulta inventario.
- `routes/lotes.js`: registra lotes, aplica la regla FEFO, permite búsquedas y genera reportes.

## Nota sobre la reorganización

La humanización se hizo principalmente mediante formato, nombres de bloques, comentarios y estructura visual. No se cambiaron las rutas de la API ni el comportamiento de las operaciones para conservar la compatibilidad con la base de datos y con el frontend.
