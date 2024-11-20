const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Create new user
    user = new User({ username, email, password: await bcrypt.hash(password, 10), userId: new Date().getTime().toString(36) });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, userId: user.userId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  } 
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, userId: user.userId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
