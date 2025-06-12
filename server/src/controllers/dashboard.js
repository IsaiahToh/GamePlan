const { exec } = require('child_process');
const fs = require('fs');
const Dashboard = require('../models/dashboard');

async function scrapeAndImportDashboard(req, res) {
  const userId = req.user.id;

  exec('node src/services/scrapers.js', async (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ message: 'Scraper failed', error: stderr });
    }

    const events = JSON.parse(fs.readFileSync('dashboardData.json', 'utf-8'));
    await Dashboard.findOneAndUpdate(
      { userId },
      { userId, events },
      { upsert: true, new: true }
    );
    res.json({ message: 'Dashboard data scraped and imported for user', userId });
  });
}

async function importDashboardData(req, res) {
  const userId = req.user.id;
  const events = req.body.events;

  await Dashboard.findOneAndUpdate(
    { userId },
    { userId, events },
    { upsert: true, new: true }
  );
  res.json({ message: 'Dashboard data imported for user', userId });
}

async function getDashboard(req, res) {
  const userId = req.user.id;
  const dashboard = await Dashboard.findOne({ userId });
  res.json(dashboard);
}

module.exports = {
  getDashboard,
  importDashboardData,
  scrapeAndImportDashboard,
};