const express = require("express");
const router = express.Router();
const UserTasks = require("../models/task"); // This is your userTaskSchema model
const { authenticateToken } = require("../utils/authMiddleware");

// CREATE a new task for the user
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const taskData = req.body;

    // Find or create the UserTasks document for this user
    let userTasks = await UserTasks.findOne({ userId });
    if (!userTasks) {
      userTasks = new UserTasks({ userId, tasks: [taskData] });
    } else {
      userTasks.tasks.push(taskData);
    }
    await userTasks.save();
    res.status(201).json(userTasks.tasks[userTasks.tasks.length - 1]); // Return the newly added task
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to save task", error: error.message });
  }
});

// READ all tasks for the user
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const userTasks = await UserTasks.findOne({ userId });
  res.json(userTasks ? userTasks.tasks : []);
});

// DELETE a task by id
router.delete("/:id", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const userTasks = await UserTasks.findOne({ userId });
    if (!userTasks) return res.status(404).json({ message: "Task not found" });

    const initialLength = userTasks.tasks.length;
    userTasks.tasks = userTasks.tasks.filter(
      (task) => task._id.toString() !== id
    );
    if (userTasks.tasks.length === initialLength) {
      return res.status(404).json({ message: "Task not found" });
    }
    await userTasks.save();
    res.json({ message: "Task deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete task", error: error.message });
  }
});

// GET all tasks sorted by deadline and importance
router.get(
  "/sorted/by-deadline-and-importance",
  authenticateToken,
  async (req, res) => {
    const userId = req.user.id;
    const importanceOrder = ["Very High", "High", "Med", "Low"];
    const userTasks = await UserTasks.findOne({ userId }).lean();
    let tasks = userTasks ? userTasks.tasks : [];

    // Sort by importance, then by deadline
    tasks.sort((a, b) => {
      const importanceDiff =
        importanceOrder.indexOf(a.importance) -
        importanceOrder.indexOf(b.importance);
      if (importanceDiff !== 0) return importanceDiff;
      const dateA = new Date(a.deadlineDate);
      const dateB = new Date(b.deadlineDate);
      return dateA - dateB;
    });

    res.json(tasks);
  }
);

// UPDATE a task by id
router.patch("/:id", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const userTasks = await UserTasks.findOne({ userId });
    if (!userTasks) return res.status(404).json({ message: "Task not found" });

    const task = userTasks.tasks.id(id); // Mongoose subdocument accessor
    if (!task) return res.status(404).json({ message: "Task not found" });

    Object.assign(task, req.body); // Update fields
    await userTasks.save();
    res.json(task);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update task", error: error.message });
  }
});

module.exports = router;
