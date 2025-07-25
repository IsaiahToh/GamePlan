const express = require('express');
const cors = require('cors');
const { login, signup } = require('../controllers/auth');

const router = express.Router();

router.use(cors());

router.post("/login", login);
router.post("/signup", signup);

module.exports = router;
// This code sets up an Express router for handling login requests.