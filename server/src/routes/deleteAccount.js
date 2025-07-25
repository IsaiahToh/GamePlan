const express = require('express');
const cors = require('cors');
const { deleteAccount } = require('../controllers/deleteAccount');
const { authenticateToken } = require('../utils/authMiddleware');

const router = express.Router();

router.use(cors());

router.delete("/", authenticateToken, deleteAccount);

module.exports = router;
