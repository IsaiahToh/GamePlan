require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const express = require("express");
const signupRoute = require("./routes/signup");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.use(bodyParser.json());
app.use(cors());
app.use("/user", signupRoute);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
