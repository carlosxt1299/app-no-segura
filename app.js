/* ==========================================================================
   Novatech Solutions - Frontend Application Logic (app.js)
   ========================================================================== */

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initLoginForm();
  initRegisterForm();
});

/* 1. Navegación por vistas */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

function switchView(viewId) {
  const sections = document.querySelectorAll('.view-section');
  sections.forEach(s => s.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
}

/* 2. Proceso de Login AJAX */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  const alertBox = document.getElementById('loginAlert');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox.className = 'alert-box hidden';

      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
          currentUser = data.user;
          renderProfileView();
          switchView('view-profile');
        } else {
          alertBox.className = 'alert-box danger';
          alertBox.textContent = data.message || 'Credenciales de acceso inválidas.';
          alertBox.classList.remove('hidden');
        }
      } catch (err) {
        alertBox.className = 'alert-box danger';
        alertBox.textContent = 'Error de conexión con el servidor.';
        alertBox.classList.remove('hidden');
      }
    });
  }
}

/* 3. Proceso de Registro AJAX */
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  const alertBox = document.getElementById('registerAlert');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox.className = 'alert-box hidden';

      const nombre = document.getElementById('regNombre').value;
      const email = document.getElementById('regEmail').value;
      const telefono = document.getElementById('regTelefono').value;
      const bio = document.getElementById('regBio').value;
      const password = document.getElementById('regPassword').value;

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, email, telefono, bio, password })
        });

        const data = await response.json();

        if (data.success) {
          currentUser = data.user;
          renderProfileView();
          switchView('view-profile');
        } else {
          alertBox.className = 'alert-box danger';
          alertBox.textContent = data.message || 'Error al completar el registro.';
          alertBox.classList.remove('hidden');
        }
      } catch (err) {
        alertBox.className = 'alert-box danger';
        alertBox.textContent = 'Error de comunicación con el servidor.';
        alertBox.classList.remove('hidden');
      }
    });
  }
}

/* 4. Renderizado del Perfil del Empleado (Vulnerable a XSS Directo) */
function renderProfileView() {
  if (!currentUser) return;

  document.getElementById('profileName').textContent = currentUser.nombre;
  document.getElementById('profileRole').textContent = currentUser.rol || 'Empleado Novatech';
  document.getElementById('profileEmail').textContent = currentUser.email;

  const bioDisplay = document.getElementById('profileBioDisplay');

  // VULNERABILIDAD CRÍTICA XSS: Asignación mediante innerHTML sin sanitizar
  bioDisplay.innerHTML = currentUser.bio || 'Sin biografía registrada.';
}

function logout() {
  currentUser = null;
  switchView('view-login');
}
