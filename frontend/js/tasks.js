/**
 * tasks.js — Task rendering, CRUD, drag-and-drop, search
 */

let allTasks       = [];
let activeFilter   = 'all';
let activePriority = '';
let searchQuery    = '';
let deleteTargetId = null;

const taskList    = document.getElementById('task-list');
const taskLoading = document.getElementById('task-loading');
const taskEmpty   = document.getElementById('task-empty');
const taskModalOverlay  = document.getElementById('task-modal-overlay');
const deleteModalOverlay = document.getElementById('delete-modal-overlay');
const taskForm    = document.getElementById('task-form');
const modalTitle  = document.getElementById('modal-title');
const modalSubmit = document.getElementById('modal-submit');
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');

// ── Load tasks ────────────────────────────────────────────────────────────────
async function loadTasks(showSkeleton = false) {
  if (showSkeleton) {
    taskLoading.style.display = 'flex';
    taskList.style.display    = 'none';
    taskEmpty.style.display   = 'none';
  }
  try {
    const params = {};
    if (activeFilter !== 'all') params.filter = activeFilter;
    if (activePriority)         params.priority = activePriority;
    if (searchQuery)            params.search = searchQuery;

    const { tasks, stats } = await TasksAPI.getAll(params);
    allTasks = tasks;
    renderTasks(tasks);
    updateStats(stats);
    updateCounts(stats);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    taskLoading.style.display = 'none';
    taskList.style.display    = 'flex';
  }
}

// ── Render tasks ──────────────────────────────────────────────────────────────
function renderTasks(tasks) {
  taskList.innerHTML = '';
  if (tasks.length === 0) {
    taskEmpty.style.display = 'flex';
    const hasFilter = activeFilter !== 'all' || activePriority || searchQuery;
    document.getElementById('empty-title').textContent = hasFilter ? 'No matching tasks' : 'No tasks yet';
    document.getElementById('empty-sub').textContent   = hasFilter ? 'Try a different filter' : 'Add your first task to get started';
    return;
  }
  taskEmpty.style.display = 'none';
  tasks.forEach((task, idx) => {
    const li = createTaskCard(task, idx);
    taskList.appendChild(li);
  });
  initDragAndDrop();
}

// ── Create task card ──────────────────────────────────────────────────────────
function createTaskCard(task, idx) {
  const li = document.createElement('li');
  li.className = 'task-card' + (task.completed ? ' task-card--completed' : '');
  li.dataset.id = task._id;
  li.style.animationDelay = (idx * 40) + 'ms';
  li.draggable = true;

  const due     = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due && due < new Date() && !task.completed;
  const dueStr  = due ? due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

  li.innerHTML = `
    <button class="task-check${task.completed ? ' task-check--done' : ''}" data-id="${task._id}" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}"></button>
    <div class="task-body">
      <div class="task-title">${escapeHtml(task.title)}</div>
      ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
      <div class="task-meta">
        <span class="task-badge task-badge--${task.priority}">${capitalise(task.priority)}</span>
        ${due ? `<span class="task-badge ${overdue ? 'task-badge--overdue' : 'task-badge--due'}">📅 ${dueStr}</span>` : ''}
      </div>
    </div>
    <div class="task-actions">
      <button class="task-action-btn task-edit-btn" data-id="${task._id}" title="Edit">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="task-action-btn task-action-btn--delete task-delete-btn" data-id="${task._id}" title="Delete">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
  `;

  li.querySelector('.task-check').addEventListener('click', () => toggleComplete(task._id, !task.completed));
  li.querySelector('.task-edit-btn').addEventListener('click', () => openEditModal(task));
  li.querySelector('.task-delete-btn').addEventListener('click', () => openDeleteModal(task));
  return li;
}

// ── Toggle complete ───────────────────────────────────────────────────────────
async function toggleComplete(id, completed) {
  try {
    await TasksAPI.update(id, { completed });
    await loadTasks();
    showToast(completed ? 'Task completed! ✓' : 'Task marked pending', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Create modal ──────────────────────────────────────────────────────────────
document.getElementById('add-task-btn').addEventListener('click', openCreateModal);

function openCreateModal() {
  taskForm.reset();
  document.getElementById('task-id').value = '';
  modalTitle.textContent = 'New Task';
  modalSubmit.querySelector('.btn__text').textContent = 'Create Task';
  taskModalOverlay.style.display = 'flex';
  setTimeout(() => document.getElementById('task-title').focus(), 50);
}

// ── Edit modal ────────────────────────────────────────────────────────────────
function openEditModal(task) {
  document.getElementById('task-id').value       = task._id;
  document.getElementById('task-title').value    = task.title;
  document.getElementById('task-desc').value     = task.description || '';
  document.getElementById('task-priority').value = task.priority;
  document.getElementById('task-due').value      = task.dueDate ? task.dueDate.split('T')[0] : '';
  modalTitle.textContent = 'Edit Task';
  modalSubmit.querySelector('.btn__text').textContent = 'Save Changes';
  taskModalOverlay.style.display = 'flex';
  setTimeout(() => document.getElementById('task-title').focus(), 50);
}

// ── Task form submit ──────────────────────────────────────────────────────────
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('task-id').value;
  const payload = {
    title:       document.getElementById('task-title').value.trim(),
    description: document.getElementById('task-desc').value.trim(),
    priority:    document.getElementById('task-priority').value,
    dueDate:     document.getElementById('task-due').value || null,
  };
  setModalLoading(true);
  try {
    if (id) {
      await TasksAPI.update(id, payload);
      showToast('Task updated', 'success');
    } else {
      await TasksAPI.create(payload);
      showToast('Task created 🚀', 'success');
    }
    closeTaskModal();
    await loadTasks();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setModalLoading(false);
  }
});

function setModalLoading(loading) {
  const text    = modalSubmit.querySelector('.btn__text');
  const spinner = modalSubmit.querySelector('.btn__spinner');
  modalSubmit.disabled     = loading;
  text.style.display    = loading ? 'none' : 'inline';
  spinner.style.display = loading ? 'inline-block' : 'none';
}

function closeTaskModal() {
  taskModalOverlay.style.display = 'none';
  taskForm.reset();
}

document.getElementById('modal-close').addEventListener('click',  closeTaskModal);
document.getElementById('modal-cancel').addEventListener('click', closeTaskModal);
taskModalOverlay.addEventListener('click', (e) => { if (e.target === taskModalOverlay) closeTaskModal(); });

// ── Delete modal ──────────────────────────────────────────────────────────────
function openDeleteModal(task) {
  deleteTargetId = task._id;
  document.getElementById('delete-task-name').textContent = task.title;
  deleteModalOverlay.style.display = 'flex';
}

function closeDeleteModal() {
  deleteModalOverlay.style.display = 'none';
  deleteTargetId = null;
}

document.getElementById('delete-modal-close').addEventListener('click', closeDeleteModal);
document.getElementById('delete-cancel').addEventListener('click',      closeDeleteModal);
deleteModalOverlay.addEventListener('click', (e) => { if (e.target === deleteModalOverlay) closeDeleteModal(); });

document.getElementById('delete-confirm').addEventListener('click', async () => {
  if (!deleteTargetId) return;
  const btn = document.getElementById('delete-confirm');
  btn.disabled    = true;
  btn.textContent = 'Deleting...';
  try {
    await TasksAPI.delete(deleteTargetId);
    closeDeleteModal();
    await loadTasks();
    showToast('Task deleted', 'info');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Delete';
  }
});

// ── Sidebar filters ───────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item[data-filter]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item[data-filter]').forEach((b) => b.classList.remove('nav-item--active'));
    btn.classList.add('nav-item--active');
    activeFilter   = btn.dataset.filter;
    activePriority = '';
    document.querySelectorAll('.nav-item[data-priority]').forEach((b) => b.classList.remove('nav-item--active'));
    loadTasks();
  });
});

document.querySelectorAll('.nav-item[data-priority]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const same = activePriority === btn.dataset.priority;
    document.querySelectorAll('.nav-item[data-priority]').forEach((b) => b.classList.remove('nav-item--active'));
    activePriority = same ? '' : btn.dataset.priority;
    if (!same) btn.classList.add('nav-item--active');
    loadTasks();
  });
});

// ── Search ────────────────────────────────────────────────────────────────────
let searchTimer;
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim();
  searchClear.style.display = searchQuery ? 'flex' : 'none';
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadTasks, 300);
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClear.style.display = 'none';
  loadTasks();
});

// ── Stats ─────────────────────────────────────────────────────────────────────
function updateStats({ total, completed, pending }) {
  document.getElementById('stat-total').textContent     = total;
  document.getElementById('stat-pending').textContent   = pending;
  document.getElementById('stat-completed').textContent = completed;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.getElementById('stat-progress').textContent = pct + '%';
  setTimeout(() => {
    document.getElementById('stat-bar-total').style.width     = total > 0 ? '100%' : '0%';
    document.getElementById('stat-bar-pending').style.width   = total > 0 ? Math.round(pending   / total * 100) + '%' : '0%';
    document.getElementById('stat-bar-completed').style.width = total > 0 ? Math.round(completed / total * 100) + '%' : '0%';
  }, 100);
  const circumference = 113;
  const offset = circumference - (pct / 100) * circumference;
  document.getElementById('progress-ring-fill').style.strokeDashoffset = offset;
}

function updateCounts({ total, completed, pending }) {
  document.getElementById('count-all').textContent       = total;
  document.getElementById('count-pending').textContent   = pending;
  document.getElementById('count-completed').textContent = completed;
}

// ── Drag and drop ─────────────────────────────────────────────────────────────
let dragSrc = null;
function initDragAndDrop() {
  taskList.querySelectorAll('.task-card').forEach((item) => {
    item.addEventListener('dragstart', (e) => {
      dragSrc = item;
      e.dataTransfer.effectAllowed = 'move';
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      taskList.querySelectorAll('.task-card').forEach((c) => c.classList.remove('drag-over'));
    });
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (item !== dragSrc) item.classList.add('drag-over');
    });
    item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
    item.addEventListener('drop', async (e) => {
      e.preventDefault();
      if (dragSrc && dragSrc !== item) {
        const all     = [...taskList.querySelectorAll('.task-card')];
        const srcIdx  = all.indexOf(dragSrc);
        const destIdx = all.indexOf(item);
        if (srcIdx < destIdx) item.after(dragSrc);
        else item.before(dragSrc);
        const newOrder = [...taskList.querySelectorAll('.task-card')].map((c) => c.dataset.id);
        try { await TasksAPI.reorder(newOrder); } catch { await loadTasks(); }
      }
      item.classList.remove('drag-over');
    });
  });
}

// ── Keyboard shortcuts ────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (taskModalOverlay.style.display   !== 'none') closeTaskModal();
    if (deleteModalOverlay.style.display !== 'none') closeDeleteModal();
  }
});

// ── Utilities ─────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function capitalise(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
