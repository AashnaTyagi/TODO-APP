/**
 * tasks.js — Task CRUD routes (all protected)
 */

const router = require('express').Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { taskValidation } = require('../middleware/validate');

// All task routes require authentication
router.use(protect);

router.get('/',           getTasks);
router.post('/',          taskValidation, createTask);
router.patch('/reorder',  reorderTasks);
router.patch('/:id',      updateTask);
router.delete('/:id',     deleteTask);

module.exports = router;
