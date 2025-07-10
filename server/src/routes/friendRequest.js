const express = require('express');
const cors = require('cors');
const { sendFriendRequest, getSent, deleteFriendRequest } = require('../controllers/friendRequest');
const { authenticateToken } = require("../utils/authMiddleware");


const router = express.Router();

router.use(cors());

router.post("/", authenticateToken, sendFriendRequest);
router.get("/", authenticateToken, getSent)
router.delete("/:id", authenticateToken, deleteFriendRequest); 

module.exports = router;