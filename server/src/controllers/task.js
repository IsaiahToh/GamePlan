const UserTasks = require("../models/task");
const Dashboard = require("../models/dashboard");
const { scheduleTasks } = require("../services/scheduleTasks");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

async function createTask(req, res) {
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
    res.status(201).json({ message: "Task created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to save task", error: error.message });
  }
}

async function clearCompletedTasks(req, res) {
  try {
    const userId = req.user.id;

    await UserTasks.findOneAndUpdate(
      { userId },
      { $set: { completedTasks: [] } },
      { new: true }
    );
    if (!res) return res.status(404).json({ message: "User tasks not found" });

    res.json({ message: "All completed tasks deleted" });
  } catch (error) {
    console.error("Error deleting completed tasks:", error);
    res.status(500).json({
      message: "Failed to delete completed tasks",
      error: error.message,
    });
  }
}

async function getTasks(req, res) {
  try {
    const userId = req.user.id;
    const userTasks = await UserTasks.findOne({ userId });

    if (!userTasks) {
      return res.json({ outstandingTasks: [], completedTasks: [], scheduledTasks: [] });
    }

    if (req.query.sort) {
      userTasks.outstandingTasks.sort((a, b) => {
        // Deadline sorting (primary)
        const dateA = new Date(`${a.deadlineDate}T${a.deadlineTime}`);
        const dateB = new Date(`${b.deadlineDate}T${b.deadlineTime}`);
        const deadlineDiff = dateA - dateB;
        if (deadlineDiff !== 0) return deadlineDiff;

        // Importance sorting (secondary)
        const importanceOrder = ["Very High", "High", "Med", "Low"];
        return (
          importanceOrder.indexOf(a.importance) -
          importanceOrder.indexOf(b.importance)
        );
      });
      // Get dashboard and schedule tasks
      const dashboard = await Dashboard.findOne({ userId });
      const scheduledTasks = await scheduleTasks(
        dashboard.freeTimes,
        userTasks.outstandingTasks,
        dayjs().tz("Asia/Singapore")
      );

      // Save scheduled tasks
      userTasks.scheduledTasks = scheduledTasks;
      await userTasks.save();
    }

    res.json({
      outstandingTasks: userTasks.outstandingTasks,
      completedTasks: userTasks.completedTasks,
      scheduledTasks: userTasks.scheduledTasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch tasks", error: error.message });
  }
}

async function deleteTask(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

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
}
async function updateTask(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
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
}

async function completeTask(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
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
}

async function uncompleteTask(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
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
}

module.exports = {
  createTask,
  clearCompletedTasks,
  getTasks,
  deleteTask,
  updateTask,
  completeTask,
  uncompleteTask,
};