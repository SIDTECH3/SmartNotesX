const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

// Register
router.post('/signup', signup);

// Login
router.post('/login', login);

module.exports = router;
