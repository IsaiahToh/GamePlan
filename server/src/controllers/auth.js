const bcrypt = require("bcrypt");
const User = require("../models/user");
const { generateToken } = require("../utils/jwtUtils");

async function signup(req, res) {
  try {
    console.log("Received user data:", req.body);
    const userData = req.body;
    const { name, email, password } = userData;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User account already exists.");
      throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "user", // Default role
    });
    const savedUser = await createdUser.save();

    res
      .status(201)
      .json({ message: "User created successfully", user: savedUser });
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

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new Error("User not found");
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    const token = generateToken(existingUser);
    res.json({ email: email, token: token });
  } catch (error) {
    if (error.message === "User not found") {
      res.status(404).json({ message: "User not found" });
    } else if (error.message === "Invalid password") {
      res.status(401).json({ message: "Invalid password" });
    } else {
      res.status(500).json({ message: "Login failed: " + error.message });
    }
  }
}

module.exports = { signup, login };
