const request = require("supertest");
const express = require("express");

jest.mock("../models/dashboard", () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));
jest.mock("../models/user", () => ({
  findOne: jest.fn(),
}));

// Mock the authentication middleware BEFORE requiring the routes
jest.mock("../utils/authMiddleware", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: "test-user-id" };
    next();
  }
}));

const dashboardRoutes = require("../routes/dashboard");
const Dashboard = require("../models/dashboard");
const User = require("../models/user");

// Mock dependencies
jest.mock("../models/dashboard");
jest.mock("../models/user");
jest.mock("../services/scrapers", () => ({
  scrape: jest.fn(() => Promise.resolve([{ moduleCode: "CS1010" }])),
}));
jest.mock("../services/freeTimes", () => ({
  getWeeklyFreeTimes: jest.fn(() => Promise.resolve([{ day: "Monday", free: true }])),
}));

// Create a minimal express app for testing
const app = express();
app.use(express.json());
app.use("/api/dashboard", dashboardRoutes);

describe("dashboard controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/dashboard", () => {
    it("returns dashboard data for a valid user", async () => {
      User.findOne.mockResolvedValue({ _id: "test-user-id" });
      Dashboard.findOne.mockResolvedValue({
        lessons: [{ moduleCode: "CS1010" }],
        groups: [{ name: "Group1" }],
        firstSundayOfSem: "2025-07-27",
        blockOutTimings: [],
        freeTimes: [],
      });

      const res = await request(app)
        .get("/api/dashboard")
        .query({ email: "test@email.com" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("lessons");
      expect(res.body.lessons[0].moduleCode).toBe("CS1010");
    });

    it("returns 404 if user not found", async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/dashboard")
        .query({ email: "notfound@email.com" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "User not found");
    });

    it("returns empty dashboard if dashboard not found", async () => {
      User.findOne.mockResolvedValue({ _id: "test-user-id" });
      Dashboard.findOne.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/dashboard")
        .query({ email: "test@email.com" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ lessons: [], groups: [], firstSundayOfSem: "" });
    });
  });

  describe("POST /api/dashboard", () => {
    it("scrapes and imports dashboard data", async () => {
      Dashboard.findOneAndUpdate.mockResolvedValue({});
      const res = await request(app)
        .post("/api/dashboard")
        .send({
          url: "http://example.com",
          groups: [{ name: "Group1" }],
          firstSundayOfSem: "2025-07-27",
          blockOutTimings: [],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Dashboard data scraped and imported for user");
      expect(res.body).toHaveProperty("freeTimes");
    });

    it("returns 500 if scraper fails", async () => {
      const { getWeeklyFreeTimes } = require("../services/freeTimes");
      getWeeklyFreeTimes.mockImplementationOnce(() => {
        throw new Error("fail");
      });

      const res = await request(app)
        .post("/api/dashboard")
        .send({
          url: "http://example.com",
          groups: [],
          firstSundayOfSem: "2025-07-27",
          blockOutTimings: [],
        });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("message", "Scraper failed");
    });
  });
});