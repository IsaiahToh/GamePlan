const express = require('express');
const cors = require('cors');
const { sendFriendRequest, get, deleteFriend, addFriend } = require('../controllers/friendRequest');
const { authenticateToken } = require("../utils/authMiddleware");

const router = express.Router();

router.use(cors());

router.post("/", authenticateToken, sendFriendRequest);
router.get("/", authenticateToken, get) // Get friend requests based on type (sent, received, friends)
router.delete("/:id", authenticateToken, deleteFriend); // Delete a friend request or friendship
router.patch("/:id", authenticateToken, addFriend);

module.exports = router;