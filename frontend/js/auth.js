/**
 * auth.js — Login/signup UI and session management
 */

let currentUser = null;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const authScreen    = document.getElementById('auth-screen');
const appScreen     = document.getElementById('app-screen');
const authError     = document.getElementById('auth-error');
const authErrorText = document.getElementById('auth-error-text');
const loginForm     = document.getElementById('login-form');
const signupForm    = document.getElementById('signup-form');
const tabLogin      = document.getElementById('tab-login');
const tabSignup     = document.getElementById('tab-signup');

// ── Tab switching ─────────────────────────────────────────────────────────────
function switchTab(tab) {
  const isLogin = tab === 'login';
  tabLogin.classList.toggle('auth-tab--active', isLogin);
  tabSignup.classList.toggle('auth-tab--active', !isLogin);
  loginForm.style.display  = isLogin ? 'flex' : 'none';
  signupForm.style.display = isLogin ? 'none' : 'flex';
  clearAuthError();
}

tabLogin.addEventListener('click',  () => switchTab('login'));
tabSignup.addEventListener('click', () => switchTab('signup'));

// ── Error display ─────────────────────────────────────────────────────────────
function showAuthError(msg) {
  authErrorText.textContent = msg;
  authError.style.display = 'flex';
}
function clearAuthError() {
  authError.style.display = 'none';
  authErrorText.textContent = '';
}

// ── Button loading state ──────────────────────────────────────────────────────
function setButtonLoading(btn, loading) {
  const text    = btn.querySelector('.btn__text');
  const spinner = btn.querySelector('.btn__spinner');
  btn.disabled  = loading;
  text.style.display    = loading ? 'none' : 'inline';
  spinner.style.display = loading ? 'inline-block' : 'none';
}

// ── Password eye toggle ───────────────────────────────────────────────────────
document.querySelectorAll('.input-eye').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    input.type = input.type === 'text' ? 'password' : 'text';
  });
});

// ── Password strength hints ───────────────────────────────────────────────────
const signupPassword = document.getElementById('signup-password');
const RULES = [
  { id: 'hint-length',  test: (p) => p.length === 8 },
  { id: 'hint-upper',   test: (p) => /[A-Z]/.test(p) },
  { id: 'hint-lower',   test: (p) => /[a-z]/.test(p) },
  { id: 'hint-number',  test: (p) => /\d/.test(p) },
  { id: 'hint-special', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];
signupPassword.addEventListener('input', () => {
  const val = signupPassword.value;
  RULES.forEach(({ id, test }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('hint--valid',   test(val));
    el.classList.toggle('hint--invalid', !test(val) && val.length > 0);
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAuthError();
  const btn   = document.getElementById('login-btn');
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  setButtonLoading(btn, true);
  try {
    const data = await AuthAPI.login(email, pass);
    handleAuthSuccess(data);
  } catch (err) {
    showAuthError(err.message);
  } finally {
    setButtonLoading(btn, false);
  }
});

// ── Signup ────────────────────────────────────────────────────────────────────
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAuthError();
  const btn   = document.getElementById('signup-btn');
  const name  = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pass  = document.getElementById('signup-password').value;

  const pwValid = pass.length >= 6 && /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /\d/.test(pass) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
  if (!pwValid) {
    showAuthError('Password must be exactly 8 characters with uppercase, lowercase, number, and special character.');
    return;
  }
  setButtonLoading(btn, true);
  try {
    const data = await AuthAPI.signup(name, email, pass);
    handleAuthSuccess(data);
    showToast('Account created! Welcome to Taskflow 🎉', 'success');
  } catch (err) {
    showAuthError(err.message);
  } finally {
    setButtonLoading(btn, false);
  }
});

// ── Auth success ──────────────────────────────────────────────────────────────
function handleAuthSuccess({ token, user }) {
  localStorage.setItem('taskflow_token', token);
  localStorage.setItem('taskflow_user',  JSON.stringify(user));
  currentUser = user;
  showApp(user);
}

// ── Session check ─────────────────────────────────────────────────────────────
async function checkSession() {
  const token = localStorage.getItem('taskflow_token');
  if (!token) { showAuthScreen(); return; }
  try {
    const { user } = await AuthAPI.getMe();
    currentUser = user;
    showApp(user);
  } catch {
    logout(false);
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
function logout(notify = true) {
  localStorage.removeItem('taskflow_token');
  localStorage.removeItem('taskflow_user');
  currentUser = null;
  showAuthScreen();
  if (notify) showToast('Logged out successfully', 'info');
}
document.getElementById('logout-btn').addEventListener('click', () => logout());

// ── Screen transitions ────────────────────────────────────────────────────────
function showAuthScreen() {
  authScreen.style.display = 'flex';
  appScreen.style.display  = 'none';
}

function showApp(user) {
  authScreen.style.display = 'none';
  appScreen.style.display  = 'flex';

  const initial = (user.name || 'U')[0].toUpperCase();
  document.getElementById('sidebar-avatar').textContent = initial;
  document.getElementById('sidebar-name').textContent   = user.name;
  document.getElementById('sidebar-email').textContent  = user.email;
  document.getElementById('greeting-name').textContent  = user.name.split(' ')[0];

  const hour  = new Date().getHours();
  const greet = hour < 12 ? 'Good morning 👋' : hour < 17 ? 'Good afternoon 👋' : 'Good evening 👋';
  document.getElementById('greeting').textContent = greet;

  if (user.theme) applyTheme(user.theme, false);
}

// ── Make forms flex-column by default ────────────────────────────────────────
loginForm.style.display  = 'flex';
loginForm.style.flexDirection = 'column';
loginForm.style.gap = '20px';
signupForm.style.flexDirection = 'column';
signupForm.style.gap = '20px';

window.currentUser = () => currentUser;
window.logout      = logout;
