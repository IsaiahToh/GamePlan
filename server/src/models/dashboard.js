const mongoose = require("../config/mongodb");

const blockOutTimingSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  label: { type: String, default: "" },
}, { _id: false });

const dashboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  events: { type: Array, default: [] },
  groups: { type: Array, default: [] },
  blockOutTimings: { type: [blockOutTimingSchema], default: [] },
  firstSundayOfSem: { type: String, default: "" },
  freeTimes: { type: Array, default: [] },
});

module.exports = mongoose.model("Dashboard", dashboardSchema);