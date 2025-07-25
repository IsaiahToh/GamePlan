require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const express = require("express");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const taskRoutes = require("./routes/task");
const friendRoutes = require("./routes/friendRequest")
const deleteAccountRoutes = require("./routes/deleteAccount");

const bodyParser = require("body-parser");
const cors = require("cors");
// const createAdminAccount = require("./scripts/admin");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API is running!");
});
app.use(bodyParser.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/friend", friendRoutes)
app.use("/api/delete", deleteAccountRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});