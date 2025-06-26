const express = require("express");
const router = express.Router();
const UserTasks = require("../models/task");
const Dashboard = require("../models/dashboard");
const { authenticateToken } = require("../utils/authMiddleware");
const { scheduleTasks } = require("../services/scheduleTasks");
const dayjs = require("dayjs");

// CREATE a new task for the user (add to outstandingTasks)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const taskData = req.body;

    let userTasks = await UserTasks.findOne({ userId });
    if (!userTasks) {
      userTasks = new UserTasks({
        userId,
        outstandingTasks: [taskData],
        completedTasks: [],
        scheduledTasks: [],
      });
    } else {
      userTasks.outstandingTasks.push(taskData);
    }

    await userTasks.save();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to save task", error: error.message });
  }
});

// READ all tasks (both outstanding and completed)
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const userTasks = await UserTasks.findOne({ userId });

  if (!userTasks) {
    return res.json({ outstandingTasks: [], completedTasks: [] });
  }

  res.json({
    outstandingTasks: userTasks.outstandingTasks,
    completedTasks: userTasks.completedTasks,
    scheduledTasks: userTasks.scheduledTasks,
  });
});

// DELETE a task by id (from either outstanding or completed)
router.delete("/:id", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const userTasks = await UserTasks.findOne({ userId });
    if (!userTasks)
      return res.status(404).json({ message: "User tasks not found" });

    // Check outstanding tasks
    const outstandingIndex = userTasks.outstandingTasks.findIndex(
      (task) => task._id.toString() === id
    );

    // Check completed tasks
    const completedIndex = userTasks.completedTasks.findIndex(
      (task) => task._id.toString() === id
    );

    if (outstandingIndex !== -1) {
      userTasks.outstandingTasks.splice(outstandingIndex, 1);
    } else if (completedIndex !== -1) {
      userTasks.completedTasks.splice(completedIndex, 1);
    } else {
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

// GET sorted outstandingTasks and schedule them
router.get(
  "/sorted/by-deadline-and-importance",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const userTasks = await UserTasks.findOne({ userId });

      if (!userTasks) {
        return res.json({ outstandingTasks: [], scheduledTasks: [] });
      }

      // Sort outstandingTasks by importance then deadline
      userTasks.outstandingTasks.sort((a, b) => {
        // Importance sorting
        const importanceOrder = ["Very High", "High", "Med", "Low"];
        const importanceDiff =
          importanceOrder.indexOf(a.importance) -
          importanceOrder.indexOf(b.importance);

        if (importanceDiff !== 0) return importanceDiff;

        // Deadline sorting
        const dateA = new Date(`${a.deadlineDate}T${a.deadlineTime}`);
        const dateB = new Date(`${b.deadlineDate}T${b.deadlineTime}`);
        return dateA - dateB;
      });

      // Get dashboard and schedule tasks
      const dashboard = await Dashboard.findOne({ userId });
      const scheduledTasks = await scheduleTasks(
        dashboard.freeTimes,
        userTasks.outstandingTasks,
        dayjs()
      );

      // Save scheduled tasks
      userTasks.scheduledTasks = scheduledTasks;
      await userTasks.save();

      res.json({
        outstandingTasks: userTasks.outstandingTasks,
        scheduledTasks: userTasks.scheduledTasks,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to sort and schedule tasks",
        error: error.message,
      });
    }
  }
);

// UPDATE a task in outstandingTasks
router.patch("/:id", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const userTasks = await UserTasks.findOne({ userId });
    if (!userTasks)
      return res.status(404).json({ message: "User tasks not found" });

    // Find task in outstandingTasks
    const taskIndex = userTasks.outstandingTasks.findIndex(
      (task) => task._id.toString() === id
    );

    if (taskIndex === -1) {
      return res
        .status(404)
        .json({ message: "Task not found in outstanding tasks" });
    }

    // Update task
    userTasks.outstandingTasks[taskIndex] = {
      ...userTasks.outstandingTasks[taskIndex].toObject(),
      ...req.body,
    };

    await userTasks.save();
    res.json(userTasks.outstandingTasks[taskIndex]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update task", error: error.message });
  }
});

// Mark task as completed (move to completedTasks)
router.patch("/:id/complete", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const userTasks = await UserTasks.findOne({ userId });
    if (!userTasks)
      return res.status(404).json({ message: "User tasks not found" });

    // Find task in outstandingTasks
    const taskIndex = userTasks.outstandingTasks.findIndex(
      (task) => task._id.toString() === id
    );

    if (taskIndex === -1) {
      return res
        .status(404)
        .json({ message: "Task not found in outstanding tasks" });
    }

    // Move to completedTasks
    const [completedTask] = userTasks.outstandingTasks.splice(taskIndex, 1);
    userTasks.completedTasks.push(completedTask);

    await userTasks.save();
    res.json(completedTask);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to complete task", error: error.message });
  }
});

// Mark task as not completed (move back to outstandingTasks)
router.patch("/:id/uncomplete", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const userTasks = await UserTasks.findOne({ userId });
    if (!userTasks)
      return res.status(404).json({ message: "User tasks not found" });

    // Find task in completedTasks
    const taskIndex = userTasks.completedTasks.findIndex(
      (task) => task._id.toString() === id
    );

    if (taskIndex === -1) {
      return res
        .status(404)
        .json({ message: "Task not found in completed tasks" });
    }

    // Move to outstandingTasks
    const [outstandingTask] = userTasks.completedTasks.splice(taskIndex, 1);
    userTasks.outstandingTasks.push(outstandingTask);

    await userTasks.save();
    res.json(outstandingTask);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to uncomplete task", error: error.message });
  }
});

module.exports = router;
