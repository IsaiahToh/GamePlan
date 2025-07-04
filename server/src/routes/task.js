const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../utils/authMiddleware");
const { createTask, clearCompletedTasks, getTasks, deleteTask, updateTask, completeTask, uncompleteTask } = require("../controllers/task");

router.post("/", authenticateToken, createTask); // Create a task
router.delete("/clear", authenticateToken, clearCompletedTasks); // Clear completed tasks
router.get("/", authenticateToken, getTasks); // Get all tasks with optional sorting
router.delete("/:id", authenticateToken, deleteTask); // Delete a task
router.patch("/:id", authenticateToken, updateTask); // Update a task
router.patch("/:id/complete", authenticateToken, completeTask); // Complete a task
router.patch("/:id/uncomplete", authenticateToken, uncompleteTask); // Uncomplete a task

module.exports = router;