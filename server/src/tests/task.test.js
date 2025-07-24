const request = require("supertest");
const express = require("express");

// Mock authentication middleware
jest.mock("../utils/authMiddleware", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: "user1" };
    next();
  }
}));

// Mocks for UserTasks model
const mockFindOne = jest.fn();
const mockFindOneAndUpdate = jest.fn();
const mockSave = jest.fn();

jest.mock("../models/task", () => {
  function UserTasks(data) {
    Object.assign(this, data);
    this.save = mockSave;
  }
  UserTasks.findOne = mockFindOne;
  UserTasks.findOneAndUpdate = mockFindOneAndUpdate;
  return UserTasks;
});

jest.mock("../models/dashboard", () => ({
  findOne: jest.fn(),
}));

jest.mock("../services/scheduleTasks", () => ({
  scheduleTasks: jest.fn(() => [{ name: "Scheduled Task", day: 1, startTime: "10:00", endTime: "11:00" }]),
}));

const taskRoutes = require("../routes/task");
const UserTasks = require("../models/task");
const Dashboard = require("../models/dashboard");
const { scheduleTasks } = require("../services/scheduleTasks");

// Minimal express app
const app = express();
app.use(express.json());
app.use("/api/task", taskRoutes);

describe("task controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("gets all tasks for a user", async () => {
    mockFindOne.mockResolvedValue({
      outstandingTasks: [{ _id: "task1", name: "Test Task", userId: "user1" }],
      completedTasks: [],
      scheduledTasks: [],
    });

    const res = await request(app).get("/api/task");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.outstandingTasks)).toBe(true);
    expect(res.body.outstandingTasks[0]).toHaveProperty("name", "Test Task");
  });

  it("returns empty arrays if user has no tasks", async () => {
    mockFindOne.mockResolvedValue(null);

    const res = await request(app).get("/api/task");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      outstandingTasks: [],
      completedTasks: [],
      scheduledTasks: [],
    });
  });

  it("creates a new task for a new user", async () => {
    mockFindOne.mockResolvedValue(null);
    mockSave.mockResolvedValue();

    const res = await request(app)
      .post("/api/task")
      .send({ name: "New Task", description: "desc", deadlineDate: "2025-01-01", deadlineTime: "12:00", estimatedTimeTaken: 1, minChunk: 1, importance: "High", group: "A" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Task created successfully");
    expect(mockSave).toHaveBeenCalled();
  });

  it("adds a task to an existing user", async () => {
    mockFindOne.mockResolvedValue({
      outstandingTasks: [],
      completedTasks: [],
      scheduledTasks: [],
      save: mockSave,
    });
    mockSave.mockResolvedValue();

    const res = await request(app)
      .post("/api/task")
      .send({ name: "Another Task", description: "desc" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Task created successfully");
    expect(mockSave).toHaveBeenCalled();
  });

  it("updates a task", async () => {
    mockFindOne.mockResolvedValue({
      outstandingTasks: [
        { _id: { toString: () => "task1" }, name: "Old Task", toObject: function() { return { _id: "task1", name: "Old Task" }; } }
      ],
      save: mockSave,
    });
    mockSave.mockResolvedValue();

    const res = await request(app)
      .patch("/api/task/task1")
      .send({ name: "Updated Task" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "Updated Task");
  });

  it("returns 404 if task not found on update", async () => {
    mockFindOne.mockResolvedValue({
      outstandingTasks: [],
      save: mockSave,
    });

    const res = await request(app)
      .patch("/api/task/task404")
      .send({ name: "Doesn't exist" });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Task not found in outstanding tasks");
  });

  it("deletes a task from outstandingTasks", async () => {
    mockFindOne.mockResolvedValue({
      outstandingTasks: [
        { _id: { toString: () => "task1" }, name: "Test Task" }
      ],
      completedTasks: [],
      save: mockSave,
    });
    mockSave.mockResolvedValue();

    const res = await request(app).delete("/api/task/task1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Task deleted");
  });

  it("deletes a task from completedTasks", async () => {
    mockFindOne.mockResolvedValue({
      outstandingTasks: [],
      completedTasks: [
        { _id: { toString: () => "task2" }, name: "Completed Task" }
      ],
      save: mockSave,
    });
    mockSave.mockResolvedValue();

    const res = await request(app).delete("/api/task/task2");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Task deleted");
  });

  it("returns 404 if task not found on delete", async () => {
    mockFindOne.mockResolvedValue({
      outstandingTasks: [],
      completedTasks: [],
      save: mockSave,
    });

    const res = await request(app).delete("/api/task/task404");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Task not found");
  });

  it("completes a task", async () => {
    mockFindOne.mockResolvedValue({
      outstandingTasks: [
        { _id: { toString: () => "task1" }, name: "To Complete" }
      ],
      completedTasks: [],
      save: mockSave,
    });
    mockSave.mockResolvedValue();

    const res = await request(app).patch("/api/task/task1/complete");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "To Complete");
  });

  it("returns 404 if task not found in outstandingTasks on complete", async () => {
    mockFindOne.mockResolvedValue({
      outstandingTasks: [],
      completedTasks: [],
      save: mockSave,
    });

    const res = await request(app).patch("/api/task/task404/complete");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Task not found in outstanding tasks");
  });

  it("uncompletes a task", async () => {
    mockFindOne.mockResolvedValue({
      outstandingTasks: [],
      completedTasks: [
        { _id: { toString: () => "task2" }, name: "To Uncomplete" }
      ],
      save: mockSave,
    });
    mockSave.mockResolvedValue();

    const res = await request(app).patch("/api/task/task2/uncomplete");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "To Uncomplete");
  });

  it("returns 404 if task not found in completedTasks on uncomplete", async () => {
    mockFindOne.mockResolvedValue({
      outstandingTasks: [],
      completedTasks: [],
      save: mockSave,
    });

    const res = await request(app).patch("/api/task/task404/uncomplete");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Task not found in completed tasks");
  });

  it("clears completed tasks", async () => {
    mockFindOneAndUpdate.mockResolvedValue({});

    const res = await request(app).delete("/api/task/clear");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "All completed tasks deleted");
  });

  it("returns 404 if user tasks not found on clear completed", async () => {
    mockFindOneAndUpdate.mockResolvedValue(null);

    const res = await request(app).delete("/api/task/clear");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "User tasks not found");
  });

  it("sorts and schedules tasks if sort query is present", async () => {
    mockFindOne.mockResolvedValue({
      outstandingTasks: [
        { _id: "task1", name: "A", deadlineDate: "2025-01-01", deadlineTime: "12:00", importance: "High" },
        { _id: "task2", name: "B", deadlineDate: "2025-01-02", deadlineTime: "12:00", importance: "Low" }
      ],
      completedTasks: [],
      scheduledTasks: [],
      save: mockSave,
    });
    Dashboard.findOne.mockResolvedValue({ freeTimes: [] });
    mockSave.mockResolvedValue();

    const res = await request(app).get("/api/task?sort=deadline");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.scheduledTasks)).toBe(true);
    expect(scheduleTasks).toHaveBeenCalled();
  });
});