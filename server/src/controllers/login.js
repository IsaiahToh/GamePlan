const authService = require("../services/login");

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const token = await authService.login(email, password);
    res.json({ token: token });
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

module.exports = { login };
