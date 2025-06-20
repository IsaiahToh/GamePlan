const mongoose = require("../config/mongodb");

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String },
  deadlineDate: { type: String, required: true },
  deadlineTime: { type: String, required: true },
  estimatedTimeTaken: { type: Number, required: true },
  minChunk: { type: Number, required: true },
  importance: { type: String, enum: ["Low", "Med", "High", "Very High"], required: true },
  group: { type: String, required: true },
});

module.exports = mongoose.model("Task", taskSchema);