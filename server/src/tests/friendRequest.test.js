const request = require("supertest");
const express = require("express");

// Mock authentication middleware BEFORE requiring the routes
jest.mock("../utils/authMiddleware", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: "user1" };
    next();
  }
}));

// Mock FriendRequest as a constructor function with .save and static methods
jest.mock("../models/friendRequest", () => {
  const mockSave = jest.fn().mockResolvedValue();
  const mockFindOne = jest.fn();
  const mockFind = jest.fn();
  const mockFindOneAndDelete = jest.fn();
  const mockFindOneAndUpdate = jest.fn();

  function FriendRequest() {
    return { save: mockSave };
  }
  FriendRequest.findOne = mockFindOne;
  FriendRequest.find = mockFind;
  FriendRequest.findOneAndDelete = mockFindOneAndDelete;
  FriendRequest.findOneAndUpdate = mockFindOneAndUpdate;
  FriendRequest.mockSave = mockSave;
  FriendRequest.mockFindOne = mockFindOne;
  FriendRequest.mockFind = mockFind;
  FriendRequest.mockFindOneAndDelete = mockFindOneAndDelete;
  FriendRequest.mockFindOneAndUpdate = mockFindOneAndUpdate;
  return FriendRequest;
});

jest.mock("../models/user", () => ({
  findOne: jest.fn(),
}));

const friendRoutes = require("../routes/friendRequest");
const User = require("../models/user");
const FriendRequest = require("../models/friendRequest");

// Minimal express app
const app = express();
app.use(express.json());
app.use("/api/friend", friendRoutes);

describe("friendRequest controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
    FriendRequest.mockSave.mockClear();
    FriendRequest.mockFindOne.mockReset();
    FriendRequest.mockFind.mockReset();
    FriendRequest.mockFindOneAndDelete.mockReset();
    FriendRequest.mockFindOneAndUpdate.mockReset();
  });

  describe("POST /api/friend", () => {
    it("sends a friend request successfully", async () => {
      User.findOne.mockResolvedValue({ _id: "user2", toString: () => "user2" });
      FriendRequest.mockFindOne
        .mockResolvedValueOnce(null) // not sent
        .mockResolvedValueOnce(null) // not received
        .mockResolvedValueOnce(null); // not already friends

      const res = await request(app)
        .post("/api/friend")
        .send({ email: "test2@email.com" });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "Friend request sent successfully");
      expect(FriendRequest.mockSave).toHaveBeenCalled();
    });

    it("returns 404 if recipient not found", async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/friend")
        .send({ email: "notfound@email.com" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "User not found");
    });

    it("prevents sending friend request to self", async () => {
      User.findOne.mockResolvedValue({ _id: "user1", toString: () => "user1" });

      const res = await request(app)
        .post("/api/friend")
        .send({ email: "self@email.com" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "You cannot add yourself as a friend");
    });

    it("prevents duplicate friend request", async () => {
      User.findOne.mockResolvedValue({ _id: "user2", toString: () => "user2" });
      FriendRequest.mockFindOne
        .mockResolvedValueOnce({}); // already sent

      const res = await request(app)
        .post("/api/friend")
        .send({ email: "test2@email.com" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("code", "ALREADY_SENT");
    });
  });

  describe("GET /api/friend", () => {
    it("gets sent requests", async () => {
      FriendRequest.mockFind.mockReturnValue({
        populate: jest.fn().mockResolvedValue([{ recipient: { email: "test2@email.com", name: "Test2" } }])
      });

      const res = await request(app).get("/api/friend?type=sent");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("gets received requests", async () => {
      FriendRequest.mockFind.mockReturnValue({
        populate: jest.fn().mockResolvedValue([{ requester: { email: "test3@email.com", name: "Test3" } }])
      });

      const res = await request(app).get("/api/friend?type=received");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    // Helper to mock chained populate calls for friends
    function mockPopulateChainForFriends() {
      return {
        populate: function () {
          return {
            populate: function () {
              return Promise.resolve([
                { requester: { email: "friend@email.com", name: "Friend" } }
              ]);
            }
          };
        }
      };
    }

    it("gets friends", async () => {
      FriendRequest.mockFind.mockReturnValue(mockPopulateChainForFriends());

      const res = await request(app).get("/api/friend?type=friends");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("returns 400 for invalid type", async () => {
      const res = await request(app).get("/api/friend?type=invalid");
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid request type");
    });
  });

  describe("DELETE /api/friend/:id", () => {
    it("deletes a friend request", async () => {
      FriendRequest.mockFindOneAndDelete.mockResolvedValue({});

      const res = await request(app).delete("/api/friend/user2");
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("code", "SUCCESS");
    });

    it("returns 404 if not found", async () => {
      FriendRequest.mockFindOneAndDelete.mockResolvedValue(null);

      const res = await request(app).delete("/api/friend/user2");
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("code", "NOT_FOUND");
    });
  });

  describe("PATCH /api/friend/:id", () => {
    it("accepts a friend request", async () => {
      FriendRequest.mockFindOneAndUpdate.mockResolvedValue({});

      const res = await request(app).patch("/api/friend/user2");
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Friend request accepted");
    });

    it("returns 404 if friend request not found", async () => {
      FriendRequest.mockFindOneAndUpdate.mockResolvedValue(null);

      const res = await request(app).patch("/api/friend/user2");
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Not found");
    });
  });
});