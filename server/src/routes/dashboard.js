const express = require("express");
const cors = require("cors");
const router = express.Router();
const {
  getDashboard,
  scrapeAndImportDashboard,
} = require("../controllers/dashboard");
const { authenticateToken } = require("../utils/authMiddleware");

router.use(cors());

router.get("/", authenticateToken, getDashboard);
router.post("/", authenticateToken, scrapeAndImportDashboard);

module.exports = router;
