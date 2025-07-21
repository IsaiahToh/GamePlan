const fs = require("fs");
const { scrape } = require("../services/scrapers");
const { getWeeklyFreeTimes } = require("../services/freeTimes");
const Dashboard = require("../models/dashboard");
const User = require("../models/user");
const dayjs = require("dayjs");

async function scrapeAndImportDashboard(req, res) {
  try {
    const userId = req.user.id;
    const url = req.body.url;
    const groups = req.body.groups;
    const firstSundayOfSem = req.body.firstSundayOfSem;
    const blockOutTimings = req.body.blockOutTimings;

    if (url) {
      await scrape(url);
    }

    const events = JSON.parse(fs.readFileSync("dashboardData.json", "utf-8"));
    const freeTimes = await getWeeklyFreeTimes(
      firstSundayOfSem,
      blockOutTimings,
      events,
      dayjs()
    );
    console.log(JSON.stringify(freeTimes, null, 2));
    const doc = await Dashboard.findOneAndUpdate(
      { userId },
      { userId, events, groups, firstSundayOfSem, blockOutTimings, freeTimes },
      { upsert: true, new: true }
    );
    res.json({
      userId,
      url: url,
      groups: groups,
      firstSundayOfSem: firstSundayOfSem,
      blockOutTimings: blockOutTimings,
      freeTimes: freeTimes,
      message: "Dashboard data scraped and imported for user",
    });
  } catch (error) {
    console.log("error:", error.message);
    res.status(500).json({ message: "Scraper failed", error: error.message });
  }
}

async function getDashboard(req, res) {
  const email = req.query.email;
  const user = await User.findOne({ email })
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const userId = user._id;
  const dashboard = await Dashboard.findOne({ userId });
  if (dashboard) {
    res.json({
      events: dashboard.events,
      groups: dashboard.groups,
      firstSundayOfSem: dashboard.firstSundayOfSem,
      blockOutTimings: dashboard.blockOutTimings,
      freeTimes: dashboard.freeTimes,
    });
  } else {
    res.json({ events: [], groups: [], firstSundayOfSem: "" });
  }
}

module.exports = {
  getDashboard,
  scrapeAndImportDashboard,
};
