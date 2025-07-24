const request = require("supertest");
const express = require("express");

// Mock authentication service BEFORE requiring the route/controller
jest.mock("../services/login", () => ({
  login: jest.fn(),
}));

const { login } = require("../controllers/login");
const authService = require("../services/login");

// Minimal express app with login route
const app = express();
app.use(express.json());
app.post("/api/auth/login", login);

describe("login controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns token for valid credentials", async () => {
    authService.login.mockResolvedValue("test-token");

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@email.com", password: "password123" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token", "test-token");
    expect(res.body).toHaveProperty("email", "test@email.com");
  });

  it("returns 404 if user not found", async () => {
    authService.login.mockRejectedValue(new Error("User not found"));

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "notfound@email.com", password: "password123" });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "User not found");
  });

  it("returns 401 if password is invalid", async () => {
    authService.login.mockRejectedValue(new Error("Invalid password"));

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@email.com", password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid password");
  });

  it("returns 500 for other errors", async () => {
    authService.login.mockRejectedValue(new Error("Something else failed"));

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@email.com", password: "password123" });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message", expect.stringContaining("Login failed:"));
  });
});