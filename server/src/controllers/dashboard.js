const fs = require("fs");
const { scrape } = require("../services/scrapers");
const Dashboard = require("../models/dashboard");
const { url } = require("inspector");

async function scrapeAndImportDashboard(req, res) {
  try {
    const userId = req.user.id;
    const url = req.body.url;
    const groups = req.body.groups;

    if (url) {
      await scrape(url);
    }

    const events = JSON.parse(fs.readFileSync("dashboardData.json", "utf-8"));
    const doc = await Dashboard.findOneAndUpdate(
      { userId },
      { userId, events, groups },
      { upsert: true, new: true }
    );
    console.log(doc);
    res.json({
      url: url, // Just to confirm the URL used
      groups: groups,
      message: "Dashboard data scraped and imported for user",
      userId,
    });
  } catch (error) {
    res.status(500).json({ message: "Scraper failed", error: error.message });
  }
}

async function importDashboardData(req, res) {
  const userId = req.user.id;
  const events = req.body.events;

  await Dashboard.findOneAndUpdate(
    { userId },
    { userId, events },
    { upsert: true, new: true }
  );
  res.json({ message: "Dashboard data imported for user", userId });
}

async function getDashboard(req, res) {
  const userId = req.user.id;
  const dashboard = await Dashboard.findOne({ userId });
  if (dashboard) {
    res.json({ events: dashboard.events, groups: dashboard.groups });
  } else {
    res.json({ events: [], groups: [] });
  }
}

async function importGroups(req, res) {
  const userId = req.user.id;
  const groups = req.body.groups;

  await Dashboard.findOneAndUpdate(
    { userId },
    { userId, groups },
    { upsert: true, new: true }
  );
  res.json({ message: "Dashboard groups imported for user", userId });
}

module.exports = {
  getDashboard,
  importDashboardData,
  scrapeAndImportDashboard,
  importGroups,
};
