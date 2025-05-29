const User = require("../models/user");
const bcrypt = require("bcrypt");

async function createUser(userData) {
  const { name, email, password } = userData;
  const existingUser = await User.findOne({ email: email });
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
  return savedUser;
}

module.exports = { createUser };
