const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const { authenticateToken } = require('../utils/authMiddleware');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const taskData = req.body;
    const newTask = new Task({ ...taskData, userId });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Failed to save task", error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const tasks = await Task.find({ userId });
  res.json(tasks);
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const deleted = await Task.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
});

router.get('/sorted/by-importance', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const importanceOrder = ["Very High", "High", "Med", "Low"];
  const tasks = await Task.find({ userId }).lean();
  tasks.sort((a, b) => importanceOrder.indexOf(a.importance) - importanceOrder.indexOf(b.importance));
  res.json(tasks);
});

module.exports = router;