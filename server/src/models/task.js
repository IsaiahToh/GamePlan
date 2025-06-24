const mongoose = require("../config/mongodb");

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  deadlineDate: { type: String, required: true },
  deadlineTime: { type: String, required: true },
  estimatedTimeTaken: { type: Number, required: true },
  minChunk: { type: Number, required: true },
  importance: {
    type: String,
    enum: ["Low", "Med", "High", "Very High"],
    required: true,
  },
  group: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const scheduledTaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  deadlineDate: { type: String, required: true },
  deadlineTime: { type: String, required: true },
  estimatedTimeTaken: { type: Number, required: true },
  minChunk: { type: Number, required: true },
  importance: {
    type: String,
    enum: ["Low", "Med", "High", "Very High"],
    required: true,
  },
  group: { type: String, required: true },
  day: { type: Number, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

// Embed taskSchema as an array in userTaskSchema
const userTaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  tasks: { type: [taskSchema], default: [] },
  sortedTasks: { type: [taskSchema], default: [] },
  scheduledTasks: { type: [scheduledTaskSchema], default: [] },
});

module.exports = mongoose.model("UserTasks", userTaskSchema);
