const mongoose = require("mongoose");

// Ensure that the .env file is loaded correctly
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB Atlas");
});
mongoose.connection.on("error", (err) => {
  console.error("Error connecting to MongoDB:", err);
});
mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});

module.exports = mongoose;
