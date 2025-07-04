const express = require("express");
const router = express.Router();
const {
  getDashboard,
  scrapeAndImportDashboard,
} = require("../controllers/dashboard");
const { authenticateToken } = require("../utils/authMiddleware");

router.get("/", authenticateToken, getDashboard);
router.post("/", authenticateToken, scrapeAndImportDashboard);

module.exports = router;