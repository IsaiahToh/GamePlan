const express = require("express");
const router = express.Router();
const {
  getDashboard,
  scrapeAndImportDashboard,
} = require("../controllers/dashboard");
const { authenticateToken } = require("../utils/authMiddleware");

router.get("/dashboard", authenticateToken, getDashboard);
router.post(
  "/dashboard/scrape-and-import",
  authenticateToken,
  scrapeAndImportDashboard
);

module.exports = router;
