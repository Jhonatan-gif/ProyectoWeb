const express = require('express');
const router = express.Router();
const { getTasks, createTask, getTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// Todas las rutas de tareas están protegidas con el middleware `protect`
router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);

module.exports = router;
