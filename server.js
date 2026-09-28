const express = require("express");
const cors = require("cors");
const path = require("path");
const usuariosRoutes = require("./routes/usuarios");
const medicamentosRoutes = require("./routes/medicamentos");
const alertasRoutes = require("./routes/alertas");
const inventarioRoutes = require("./routes/inventario");
const lotesRoutes = require("./routes/lotes");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos explícitamente
app.use(express.static(__dirname));

// Rutas API
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/medicamentos", medicamentosRoutes);
app.use("/api/alertas", alertasRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/lotes", lotesRoutes);

// Redirección por defecto: si entran a la raíz, llevar a login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// Manejador de errores 404 personalizado para ayudar al usuario
app.use((req, res) => {
  res.status(404).send(`
        <div style="font-family: sans-serif; padding: 50px; text-align: center;">
            <h1 style="color: #00315e;">404 - Página no encontrada</h1>
            <p>La URL <b>${req.url}</b> no existe en este servidor.</p>
            <p>Intenta acceder a: <a href="/login.html" style="color: #004884; font-weight: bold;">http://localhost:${PORT}/login.html</a></p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888;">Servidor de Medicamentos Seguros (Node.js/Express)</p>
        </div>
    `);
});

// Preparar la estructura mínima y luego iniciar el servidor.
// Si MySQL no está encendido o las credenciales son incorrectas, se informa claramente.
db.initializeSchema((error) => {
  if (error) {
    console.error(
      "\nNo se pudo preparar la base de datos control_medicamentos.",
    );
    console.error(
      "Verifica que MySQL esté encendido, que exista la base y que db.js tenga las credenciales correctas.",
    );
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  app.listen(PORT, () => {
    console.log(`\n====================================================`);
    console.log(`SERVIDOR INICIADO CORRECTAMENTE`);
    console.log(`Puerto: ${PORT}`);
    console.log(`URL de acceso: http://localhost:${PORT}/login.html`);
    console.log(`Base de datos preparada: control_medicamentos`);
    console.log(`====================================================\n`);
  });
});
