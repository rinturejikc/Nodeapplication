// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel');  
const jwt = require('jsonwebtoken');

const router = express.Router();

// Sign-up route for User
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user (user role is set by default)
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'user'  // Always set the role as 'user'
    });

    await newUser.save();

    res.status(200).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error signing up user' });
  }
});

// Sign-in route for User
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }  // Token expires in 1 hour
    );

    res.status(200).json({
      message: 'Sign-in successful',
      token,
      user: {
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error signing in user' });
  }
});

module.exports = router;
