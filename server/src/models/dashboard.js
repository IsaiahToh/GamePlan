const mongoose = require("../config/mongodb");

const dashboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  events: { type: Array, default: [] },
  groups: { type: Array, default: [] },
});

module.exports = mongoose.model("Dashboard", dashboardSchema);
