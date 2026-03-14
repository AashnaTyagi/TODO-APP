/**
 * app.js — Bootstrap, theme, toasts, sidebar
 */

// ── Toast system ──────────────────────────────────────────────────────────────
const toastContainer = document.getElementById('toast-container');

function showToast(message, type = 'info', duration = 3500) {
  const toast = document.createElement('div');
  toast.className = 'toast toast--' + type;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = '<span>' + (icons[type] || 'ℹ') + '</span><span>' + message + '</span>';
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
window.showToast = showToast;

// ── Theme ─────────────────────────────────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme, persist = true) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('taskflow_theme', theme);
  const sun  = themeToggle.querySelector('.theme-icon--sun');
  const moon = themeToggle.querySelector('.theme-icon--moon');
  sun.style.display  = theme === 'dark' ? 'none'  : 'block';
  moon.style.display = theme === 'dark' ? 'block' : 'none';
  if (persist && localStorage.getItem('taskflow_token')) {
    AuthAPI.updateTheme(theme).catch(() => {});
  }
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});
window.applyTheme = applyTheme;

// ── Sidebar toggle ────────────────────────────────────────────────────────────
const sidebar        = document.getElementById('sidebar');
const sidebarToggle  = document.getElementById('sidebar-toggle');
const sidebarClose   = document.getElementById('sidebar-close');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function openSidebar() {
  sidebar.classList.add('sidebar--open');
  sidebarOverlay.classList.add('sidebar-overlay--visible');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('sidebar--open');
  sidebarOverlay.classList.remove('sidebar-overlay--visible');
  document.body.style.overflow = '';
}

sidebarToggle.addEventListener('click',  openSidebar);
sidebarClose.addEventListener('click',   closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (window.innerWidth < 768) closeSidebar();
  });
});

// ── Init ──────────────────────────────────────────────────────────────────────
(async function init() {
  // Apply saved theme first to prevent flash
  const savedTheme = localStorage.getItem('taskflow_theme') || 'light';
  applyTheme(savedTheme, false);

  // Check session
  await checkSession();

  // Load tasks if logged in
  const appVisible = document.getElementById('app-screen').style.display !== 'none';
  if (appVisible) {
    await loadTasks(true);
  }
})();
