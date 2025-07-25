// auth.test.js
const request = require("supertest");
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { generateToken } = require("../utils/jwtUtils");
const { signup, login } = require("../controllers/auth"); // Your controller filename

jest.mock("../models/user");
jest.mock("../utils/jwtUtils");
jest.mock("bcrypt");

describe("Auth Controller", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post("/signup", signup);
    app.post("/login", login);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signup", () => {
    it("should create a new user and return 201", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      // Mock User.findOne to return null (no existing user)
      User.findOne.mockResolvedValue(null);
      // Mock bcrypt.hash to return a fake hashed password
      bcrypt.hash.mockResolvedValue("hashedPassword123");
      // Mock save to return the saved user
      User.prototype.save = jest.fn().mockResolvedValue({
        _id: "123",
        ...userData,
        password: "hashedPassword123",
        role: "user",
      });

      const res = await request(app).post("/signup").send(userData);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("User created successfully");
      expect(res.body.user.email).toBe(userData.email);
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(User.prototype.save).toHaveBeenCalled();
    });

    it("should return 409 if user already exists", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      User.findOne.mockResolvedValue(userData); // Simulate existing user

      const res = await request(app).post("/signup").send(userData);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("User already exists");
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
    });

    it("should return 500 on internal server error", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      User.findOne.mockRejectedValue(new Error("DB error"));

      const res = await request(app).post("/signup").send(userData);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Internal server error");
    });
  });

  describe("login", () => {
    it("should login successfully and return a token", async () => {
      const loginData = { email: "test@example.com", password: "password123" };
      const mockUser = {
        _id: "123",
        email: loginData.email,
        password: "hashedPassword",
        role: "user",
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      generateToken.mockReturnValue("mocked_jwt_token");

      const res = await request(app).post("/login").send(loginData);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(loginData.email);
      expect(res.body.token).toBe("mocked_jwt_token");
      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password
      );
      expect(generateToken).toHaveBeenCalledWith(mockUser);
    });

    it("should return 404 if user not found", async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/login")
        .send({ email: "missing@example.com", password: "password123" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found");
    });

    it("should return 401 if password is invalid", async () => {
      const mockUser = { password: "hashedPassword" };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid password");
    });

    it("should return 500 on unexpected error", async () => {
      User.findOne.mockRejectedValue(new Error("DB failure"));

      const res = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).toBe(500);
      expect(res.body.message).toContain("Login failed");
    });
  });
});
