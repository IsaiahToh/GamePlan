const fs = require("fs");
const { scrape } = require("../services/scrapers");
const Dashboard = require("../models/dashboard");
const { url } = require("inspector");

async function scrapeAndImportDashboard(req, res) {
  try {
    const userId = req.user.id;
    const url = req.body.url;
    const groups = req.body.groups;
    const firstSundayOfSem = req.body.firstSundayOfSem;
    const blockOutTimings = req.body.blockOutTimings;

    console.log(firstSundayOfSem);

    if (url) {
      await scrape(url);
    }

    const events = JSON.parse(fs.readFileSync("dashboardData.json", "utf-8"));
    const doc = await Dashboard.findOneAndUpdate(
      { userId },
      { userId, events, groups, firstSundayOfSem },
      { upsert: true, new: true }
    );
    console.log(doc);
    res.json({
      userId,
      url: url,
      groups: groups,
      firstSundayOfSem: firstSundayOfSem,
      blockOutTimings: blockOutTimings,
      message: "Dashboard data scraped and imported for user",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Scraper failed", error: error.message });
  }
}

async function getDashboard(req, res) {
  const userId = req.user.id;
  const dashboard = await Dashboard.findOne({ userId });
  if (dashboard) {
    res.json({
      events: dashboard.events,
      groups: dashboard.groups,
      firstSundayOfSem: dashboard.firstSundayOfSem,
    });
  } else {
    res.json({ events: [], groups: [], firstSundayOfSem: "" });
  }
}

module.exports = {
  getDashboard,
  scrapeAndImportDashboard,
};
