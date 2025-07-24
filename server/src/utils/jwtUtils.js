const jwt = require("jsonwebtoken");
const { secretKey } = require("../config/jwt");
const crypto = require("crypto");

function generateToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    jti: crypto.randomBytes(16).toString("hex"), // Unique token id
  };
  const options = {
    expiresIn: "1h",
    // algorithm: 'HS256'
  };
  return jwt.sign(payload, secretKey, options);
}
module.exports = { generateToken };
