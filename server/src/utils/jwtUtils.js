const jwt = require('jsonwebtoken');
const { secretKey } = require('../config/jwt');

function generateToken(user) {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role
    };
    
    const options = {
        expiresIn: '1h' // Token expires in 1 hour
    };
    
    return jwt.sign(payload, secretKey, options);
}
module.exports = { generateToken };