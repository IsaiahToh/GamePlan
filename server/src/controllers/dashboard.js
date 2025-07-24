const fs = require("fs");
const { scrape } = require("../services/scrapers");
const { getWeeklyFreeTimes } = require("../services/freeTimes");
const Dashboard = require("../models/dashboard");
const User = require("../models/user");
const dayjs = require("dayjs");

async function scrapeAndImportDashboard(req, res) {
  try {
    const userId = req.user.id;
    const newUrl = req.body.url;
    const oldUrl = await Dashboard.findOne({ userId }).then(d => d.url);
    let lessons = await Dashboard.findOne({ userId }).then(d => d.lessons);
    const groups = req.body.groups;
    const firstSundayOfSem = req.body.firstSundayOfSem;
    const blockOutTimings = req.body.blockOutTimings;

    if (newUrl.length === 0) {
      lessons = [];
    }

    if (newUrl !== oldUrl) {
      lessons = await scrape(newUrl);
    }

    const freeTimes = await getWeeklyFreeTimes(
      firstSundayOfSem,
      blockOutTimings,
      lessons,
      dayjs()
    );
    await Dashboard.findOneAndUpdate(
      { userId },
      { userId, url: newUrl, lessons, groups, firstSundayOfSem, blockOutTimings, freeTimes },
      { upsert: true, new: true }
    );
    res.json({
      userId,
      url: newUrl,
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
      lessons: dashboard.lessons,
      groups: dashboard.groups,
      firstSundayOfSem: dashboard.firstSundayOfSem,
      blockOutTimings: dashboard.blockOutTimings,
      freeTimes: dashboard.freeTimes,
    });
  } else {
    res.json({ lessons: [], groups: [], firstSundayOfSem: "" });
  }
}

module.exports = {
  getDashboard,
  scrapeAndImportDashboard,
};
