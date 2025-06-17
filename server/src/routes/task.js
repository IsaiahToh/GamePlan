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

module.exports = router;