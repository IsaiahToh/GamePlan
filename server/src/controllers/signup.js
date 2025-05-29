const userService = require("../services/signup");

async function createUser(req, res) {
  try {
    console.log("Received user data:", req.body);
    const userData = req.body;
    const newUser = await userService.createUser(userData);
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    if (error.message === "User already exists") {
      console.log("User account already exists.");
      return res.status(409).json({ message: "User already exists" });
    } else {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
}

module.exports = { createUser };
