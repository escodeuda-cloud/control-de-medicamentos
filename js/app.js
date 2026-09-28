// [CORRECCIÓN UNIVERSIDAD] Usar ruta relativa para evitar bloqueos CSP y problemas de CORS
// [CORRECCIÓN] Usar ruta relativa. Si se corre en local, se asume el mismo puerto del servidor.
const API_URL = "/api/usuarios";

// Elementos de Registro (register.html)
const registerForm = document.getElementById("registerForm");
const regNombre = document.getElementById("regNombre");
const regEmail = document.getElementById("regEmail");
const regDocumento = document.getElementById("regDocumento");
const regPassword = document.getElementById("regPassword");
const btnRegisterSubmit = document.getElementById("btnRegisterSubmit");

// Elementos de Login (login.html)
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("email"); // login.html usa id="email"
const loginPassword = document.getElementById("password"); // login.html usa id="password"

// Elementos de Verificación/Medicamentos (verificacion.html)
const btnIngresoManual = document.getElementById("btnIngresoManual");
const medicamentosList = document.getElementById("medicamentosList");

// Elementos de Perfil (usuario.html)
const btnGuardarPerfil = document.getElementById("btnGuardarPerfil");
const btnEliminarCuenta = document.getElementById("btnEliminarCuenta");
const profileNameInput = document.getElementById("profileName");
const profileEmailInput = document.getElementById("profileEmail");
const profileDocumentInput = document.getElementById("profileDocument");
const profilePasswordInput = document.getElementById("profilePassword");

// Elementos de Usuarios / Admin (lógica original)
const userForm = document.getElementById("userForm");
const userIdInput = document.getElementById("userId");
const nombreInput = document.getElementById("nombre");
const emailInput = document.getElementById("emailInput"); // id de email alternativo para no chocar
const usersList = document.getElementById("usersList");
const totalUsers = document.getElementById("totalUsers");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");

// Alerta Global
const alertBox = document.getElementById("alertBox");

// Estado global
let isEditing = false;
let medicamentos = JSON.parse(localStorage.getItem("medicamentos")) || [];
let alertas = JSON.parse(localStorage.getItem("alertas")) || [];
let inventario = JSON.parse(localStorage.getItem("inventario")) || [];

// ==========================================
// INICIALIZADOR GLOBAL
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Si estamos en la página de admin de usuarios
  if (userForm) fetchUsuarios();

  // Si estamos en la página de verificación (mostrar historial)
  if (medicamentosList) renderMedicamentos();

  // Cargar datos del usuario logueado en la UI
  loadUserData();
});

// ==========================================
// 1. LÓGICA DE REGISTRO (register.html)
// ==========================================
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userData = {
      nombre: regNombre.value.trim(),
      email: regEmail.value.trim(),
      password: regPassword.value,
      id_rol: 2,
    };

    if (
      !userData.nombre ||
      !userData.email ||
      !regDocumento.value.trim() ||
      !userData.password
    ) {
      showAlert("Completa todos los campos obligatorios.", "error");
      return;
    }

    if (userData.password.length < 8) {
      showAlert("La contraseña debe tener mínimo 8 caracteres.", "error");
      return;
    }

    if (btnRegisterSubmit) btnRegisterSubmit.disabled = true;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "No se pudo registrar el usuario");

      localStorage.setItem(
        "usuario",
        JSON.stringify({
          id_usuario: data.id,
          nombre: userData.nombre,
          email: userData.email,
          id_rol: userData.id_rol,
        }),
      );
      showAlert("Cuenta creada correctamente. Redirigiendo...", "success");
      registerForm.reset();
      setTimeout(() => {
        window.location.href = "principal.html";
      }, 900);
    } catch (error) {
      showAlert(
        error.message || "No se pudo conectar con el servidor.",
        "error",
      );
    } finally {
      if (btnRegisterSubmit) btnRegisterSubmit.disabled = false;
    }
  });
}

// ==========================================
// 2. LÓGICA DE LOGIN (login.html)
// ==========================================
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginEmail.value.trim();
    const pass = loginPassword.value.trim();
    if (email === "" || pass === "") {
      showAlert("Por favor, ingresa tus credenciales.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const usuario = await response.json();
      if (!response.ok)
        throw new Error(usuario.message || "No se pudo iniciar sesión");

      localStorage.setItem("usuario", JSON.stringify(usuario));
      showAlert(
        "Inicio de sesión exitoso. Ingresando al sistema...",
        "success",
      );
      setTimeout(() => {
        window.location.href = "principal.html";
      }, 900);
    } catch (error) {
      showAlert(error.message, "error");
    }
  });
}

// ==========================================
// 2.5 LÓGICA DE PERFIL (usuario.html)
// ==========================================
if (btnGuardarPerfil) {
  btnGuardarPerfil.addEventListener("click", async (e) => {
    e.preventDefault();
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
    if (!usuario || !(usuario.id_usuario || usuario.id)) {
      showAlert("No se encontró una sesión activa.", "error");
      return;
    }
    const password = profilePasswordInput ? profilePasswordInput.value : "";
    if (password && password.length < 8) {
      showAlert("La nueva contraseña debe tener mínimo 8 caracteres.", "error");
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/${usuario.id_usuario || usuario.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: profileNameInput.value.trim(),
            email: profileEmailInput.value.trim(),
            password: password || undefined,
          }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "No se pudo actualizar el perfil");
      usuario.nombre = profileNameInput.value.trim();
      usuario.email = profileEmailInput.value.trim();
      usuario.documento = profileDocumentInput.value.trim();
      localStorage.setItem("usuario", JSON.stringify(usuario));
      if (profilePasswordInput) profilePasswordInput.value = "";
      showAlert("Perfil actualizado correctamente.", "success");
      loadUserData();
    } catch (error) {
      showAlert(error.message, "error");
    }
  });
}

if (btnEliminarCuenta) {
  btnEliminarCuenta.addEventListener("click", (e) => {
    e.preventDefault();
    if (
      confirm(
        "¿Deseas desactivar tu cuenta? El registro se conservará para auditoría.",
      )
    ) {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
      if (!usuario || !(usuario.id_usuario || usuario.id)) {
        showAlert("No se encontró la sesión activa.", "error");
        return;
      }
      fetch(`${API_URL}/${usuario.id_usuario || usuario.id}/desactivar`, {
        method: "PATCH",
      })
        .then((response) =>
          response.json().then((data) => ({ response, data })),
        )
        .then(({ response, data }) => {
          if (!response.ok)
            throw new Error(data.message || "No se pudo desactivar la cuenta");
          localStorage.removeItem("usuario");
          showAlert("Cuenta desactivada. Cerrando sesión...", "success");
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1500);
        })
        .catch((error) => showAlert(error.message, "error"));
    }
  });
}

// ==========================================
// 3. LÓGICA DE MEDICAMENTOS (verificacion.html)
// ==========================================
if (btnIngresoManual) {
  btnIngresoManual.addEventListener("click", () => {
    const nombreMed = prompt("Ingrese el nombre del medicamento:");
    if (!nombreMed) return; // Si cancela

    const fechaCad = prompt("Ingrese la fecha de caducidad (Ej. Oct 2026):");
    if (!fechaCad) return; // Si cancela

    const nuevoMed = {
      id: Date.now(),
      nombre: nombreMed,
      fecha: fechaCad,
      fechaRegistro: new Date().toLocaleTimeString(),
      estado: "Válido", // Por defecto
    };

    // Guardar al inicio del array para que aparezca en orden de registro (los más recientes primero)
    medicamentos.unshift(nuevoMed);
    localStorage.setItem("medicamentos", JSON.stringify(medicamentos));

    showAlert("Medicamento registrado manualmente con éxito.", "success");
    renderMedicamentos();
  });
}

function renderMedicamentos() {
  if (!medicamentosList) return;

  if (medicamentos.length === 0) {
    medicamentosList.innerHTML = `<div class="p-6 text-center text-outline">No hay medicamentos en el historial reciente.</div>`;
    return;
  }

  medicamentosList.innerHTML = medicamentos
    .map((med) => {
      return `
        <div class="bg-surface-container-lowest p-5 flex items-center justify-between border-t border-outline-variant/10 group hover:bg-surface-bright transition-colors">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-2xl">medication</span>
              </div>
              <div>
                <p class="font-bold text-on-surface">${escapeHTML(med.nombre)}</p>
                <p class="text-xs text-outline">Vence: ${escapeHTML(med.fecha)} | Reg: ${med.fechaRegistro}</p>
              </div>
            </div>
            <div class="flex items-center gap-6">
              <span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                ${med.estado}
              </span>
              <span class="material-symbols-outlined text-outline group-hover:text-primary transition-colors cursor-pointer">
                chevron_right
              </span>
            </div>
        </div>
        `;
    })
    .join("");
}

// ==========================================
// 4. LÓGICA DE USUARIOS CRUD (Admin / Base)
// ==========================================
if (userForm) {
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userData = {
      nombre: nombreInput.value.trim(),
      email: emailInput ? emailInput.value.trim() : "",
      // Podrías añadir contraseña y documento aquí
    };

    if (isEditing) {
      await handleUpdate(userIdInput.value, userData);
    } else {
      await handleCreate(userData);
    }
  });
}

if (btnCancelar) {
  btnCancelar.addEventListener("click", resetForm);
}

// GET: Obtener todos los usuarios
async function fetchUsuarios() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error en respuesta del servidor");

    const data = await response.json();
    renderTable(data);
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    // showAlert('Error de conexión al cargar los datos.', 'error');
  }
}

// POST: Crear usuario
async function handleCreate(userData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al crear usuario");

    showAlert("Usuario registrado correctamente.", "success");
    resetForm();
    fetchUsuarios();
  } catch (error) {
    showAlert(error.message, "error");
  }
}

// PUT: Actualizar usuario
async function handleUpdate(id, userData) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Error al actualizar usuario");

    showAlert("Datos de usuario actualizados.", "success");
    resetForm();
    fetchUsuarios();
  } catch (error) {
    showAlert(error.message, "error");
  }
}

// PATCH: Desactivar usuario sin borrarlo físicamente
async function handleDelete(id) {
  if (
    !confirm(
      "¿Desactivar este usuario? El registro permanecerá en la base de datos.",
    )
  )
    return;
  try {
    const response = await fetch(`${API_URL}/${id}/desactivar`, {
      method: "PATCH",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(data.message || "Error al desactivar usuario");
    showAlert("Usuario desactivado correctamente.", "success");
    fetchUsuarios();
  } catch (error) {
    showAlert(error.message, "error");
  }
}

// Editar: Cargar datos en el formulario
window.editUser = function (id, nombre, email) {
  isEditing = true;
  if (userIdInput) userIdInput.value = id;
  if (nombreInput) nombreInput.value = nombre;
  if (emailInput) emailInput.value = email;

  // Cambiar UI del formulario
  if (btnGuardar)
    btnGuardar.innerHTML = '<i class="fa-solid fa-save"></i> Guardar Cambios';
  if (btnCancelar) btnCancelar.classList.remove("hidden");

  // Smooth scroll to top
  const formSection = document.querySelector(".form-section");
  if (formSection) formSection.scrollIntoView({ behavior: "smooth" });
};

window.deleteUser = handleDelete;

// ==========================================
// 5. HELPERS / UTILIDADES GLOBALES
// ==========================================
function renderTable(users) {
  if (totalUsers) totalUsers.textContent = users.length;
  if (!usersList) return;

  if (users.length === 0) {
    usersList.innerHTML = `<tr><td colspan="4" class="text-center"><i class="fa-solid fa-inbox text-muted"></i> Aún no hay usuarios registrados.</td></tr>`;
    return;
  }

  usersList.innerHTML = users
    .map((user) => {
      const initial = user.nombre ? user.nombre.charAt(0).toUpperCase() : "?";
      return `
            <tr>
                <td>#${user.id}</td>
                <td>
                    <div class="avatar-cell">
                        <div class="avatar">${initial}</div>
                        <span>${escapeHTML(user.nombre || "")}</span>
                    </div>
                </td>
                <td><a href="mailto:${escapeHTML(user.email || "")}" style="color:var(--text-muted); text-decoration:none;">${escapeHTML(user.email || "")}</a></td>
                <td>
                    <div class="td-actions">
                        <button class="btn btn-edit-sm" onclick="editUser(${user.id}, '${escapeString(user.nombre || "")}', '${escapeString(user.email || "")}')">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-danger-sm" onclick="deleteUser(${user.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function loadUserData() {
  const usuarioStr = localStorage.getItem("usuario");
  if (!usuarioStr) return;

  const usuario = JSON.parse(usuarioStr);

  // Para perfil (usuario.html)
  const profileDisplayName = document.getElementById("profileDisplayName");
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profileDocument = document.getElementById("profileDocument");

  if (profileDisplayName)
    profileDisplayName.textContent = "Dr. " + escapeHTML(usuario.nombre);
  if (profileName) profileName.value = usuario.nombre;
  if (profileEmail) profileEmail.value = usuario.email;
  if (profileDocument) profileDocument.value = usuario.documento;

  // Para elementos con la clase .user-name-display en toda la app
  const nameDisplays = document.querySelectorAll(".user-name-display");
  nameDisplays.forEach((el) => {
    el.textContent = escapeHTML(usuario.nombre);
  });
}

function resetForm() {
  isEditing = false;
  if (userForm) userForm.reset();
  if (userIdInput) userIdInput.value = "";
  if (btnGuardar)
    btnGuardar.innerHTML = '<i class="fa-solid fa-save"></i> Guardar';
  if (btnCancelar) btnCancelar.classList.add("hidden");
}

function showAlert(message, type) {
  if (!alertBox) return;

  alertBox.innerHTML = `
        <i class="fa-solid ${type === "success" ? "fa-check-circle" : "fa-circle-exclamation"}"></i>
        <span>${message}</span>
    `;
  alertBox.className = `alert alert-${type} p-4 text-sm max-w-sm w-full`;
  alertBox.classList.remove("hidden");

  // Ocultar después de 4 segundos
  setTimeout(() => {
    alertBox.classList.add("hidden");
  }, 4000);
}

// Evita enlaces sin respuesta y avisa cuando una opción pertenece a la versión 2.0.
document.addEventListener("click", (event) => {
  const version2Control = event.target.closest("[data-version2]");
  if (!version2Control) return;
  event.preventDefault();
  showAlert("Esta funcionalidad hace parte de la Versión 2.0.", "error");
});

// Evitar inyección de código (XSS)
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[tag] || tag,
  );
}

function escapeString(str) {
  if (!str) return "";
  return str.replace(/'/g, "\\'");
}
