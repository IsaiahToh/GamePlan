const request = require("supertest");
const express = require("express");

// Mock signup service BEFORE requiring the controller
jest.mock("../services/signup", () => ({
  createUser: jest.fn(),
}));

const { createUser } = require("../controllers/signup");
const userService = require("../services/signup");

// Minimal express app with signup route
const app = express();
app.use(express.json());
app.post("/api/auth/signup", createUser);

describe("signup controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates a user successfully", async () => {
    userService.createUser.mockResolvedValue({ id: "user1", email: "test@email.com" });

    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Test", email: "test@email.com", password: "password123" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User created successfully");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe("test@email.com");
  });

  it("returns 409 if user already exists", async () => {
    userService.createUser.mockRejectedValue(new Error("User already exists"));

    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Test", email: "test@email.com", password: "password123" });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("message", "User already exists");
  });

  it("returns 500 for other errors", async () => {
    userService.createUser.mockRejectedValue(new Error("Something else failed"));

    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Test", email: "test@email.com", password: "password123" });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message", "Internal server error");
    expect(res.body).toHaveProperty("error", "Something else failed");
  });
});