const express = require('express');
const cors = require('cors');
const { login } = require('../controllers/login');

const router = express.Router();

router.use(cors());

router.post("/login", login);

module.exports = router;
// This code sets up an Express router for handling login requests.