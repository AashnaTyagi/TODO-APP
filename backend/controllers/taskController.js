/**
 * taskController.js — CRUD operations for user tasks
 * All routes require authentication; tasks are scoped to req.user._id
 */

const Task = require('../models/Task');

// ── GET /api/tasks — List all tasks for current user ──────────────────────────
const getTasks = async (req, res, next) => {
  try {
    const { filter, search, priority, sortBy = 'order', order = 'asc' } = req.query;

    // Build dynamic filter query
    const query = { user: req.user._id };

    if (filter === 'completed') query.completed = true;
    if (filter === 'pending')   query.completed = false;
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      query.priority = priority;
    }

    // Case-insensitive search on title and description
    if (search && search.trim()) {
      query.$or = [
        { title:       { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const validSortFields = ['order', 'createdAt', 'dueDate', 'priority', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'order';

    const tasks = await Task.find(query)
      .sort({ [sortField]: sortOrder, createdAt: -1 })
      .lean();

    // Return summary statistics alongside tasks
    const allUserTasks = await Task.find({ user: req.user._id }).lean();
    const stats = {
      total:     allUserTasks.length,
      completed: allUserTasks.filter((t) => t.completed).length,
      pending:   allUserTasks.filter((t) => !t.completed).length,
    };

    res.json({ tasks, stats });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/tasks — Create a new task ───────────────────────────────────────
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    // Place new task at the end of the user's list
    const maxOrderTask = await Task.findOne({ user: req.user._id })
      .sort({ order: -1 })
      .select('order');

    const task = await Task.create({
      user:        req.user._id,
      title,
      description: description || '',
      priority:    priority || 'medium',
      dueDate:     dueDate || null,
      order:       maxOrderTask ? maxOrderTask.order + 1 : 0,
    });

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/tasks/:id — Update a task ──────────────────────────────────────
const updateTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority, dueDate } = req.body;

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Apply only provided fields (partial updates)
    if (title       !== undefined) task.title       = title;
    if (description !== undefined) task.description = description;
    if (completed   !== undefined) task.completed   = completed;
    if (priority    !== undefined) task.priority    = priority;
    if (dueDate     !== undefined) task.dueDate     = dueDate;

    await task.save();
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/tasks/:id — Remove a task ─────────────────────────────────────
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/tasks/reorder — Persist drag-and-drop order ────────────────────
const reorderTasks = async (req, res, next) => {
  try {
    const { taskIds } = req.body; // Array of task IDs in new order

    if (!Array.isArray(taskIds)) {
      return res.status(400).json({ error: 'taskIds must be an array.' });
    }

    // Bulk update order values
    const updates = taskIds.map((id, index) =>
      Task.updateOne({ _id: id, user: req.user._id }, { order: index })
    );

    await Promise.all(updates);
    res.json({ message: 'Tasks reordered successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, reorderTasks };
