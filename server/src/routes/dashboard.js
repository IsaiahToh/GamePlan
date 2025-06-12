const express = require('express');
const router = express.Router();
const { getDashboard, importDashboardData, scrapeAndImportDashboard } = require('../controllers/dashboard');
const { authenticateToken } = require('../utils/authMiddleware');

router.get('/dashboard', authenticateToken, getDashboard);
router.post('/dashboard/import', authenticateToken, importDashboardData);
router.post('/dashboard/scrape-and-import', authenticateToken, scrapeAndImportDashboard);

module.exports = router;