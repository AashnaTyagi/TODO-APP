/**
 * api.js — Centralized HTTP client for all backend API calls
 * Automatically attaches JWT token and handles common error patterns
 */

const API_BASE = '/api';

/**
 * Core fetch wrapper: adds Auth header, JSON content-type, and error handling
 * @param {string} endpoint - API path (e.g. '/auth/login')
 * @param {object} options  - fetch options override
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('taskflow_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Parse JSON body (even for errors)
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const err = new Error(data.error || `Request failed (${response.status})`);
    err.status = response.status;
    throw err;
  }

  return data;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
const AuthAPI = {
  signup: (name, email, password) =>
    apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getMe: () => apiFetch('/auth/me'),

  updateTheme: (theme) =>
    apiFetch('/auth/theme', { method: 'PATCH', body: JSON.stringify({ theme }) }),
};

// ─── Tasks API ────────────────────────────────────────────────────────────────
const TasksAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    return apiFetch(`/tasks${qs ? '?' + qs : ''}`);
  },

  create: (task) =>
    apiFetch('/tasks', { method: 'POST', body: JSON.stringify(task) }),

  update: (id, updates) =>
    apiFetch(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),

  delete: (id) =>
    apiFetch(`/tasks/${id}`, { method: 'DELETE' }),

  reorder: (taskIds) =>
    apiFetch('/tasks/reorder', { method: 'PATCH', body: JSON.stringify({ taskIds }) }),
};
