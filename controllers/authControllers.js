// controllers/authController.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailerConfig = require('../config/nodemailerConfig');
const { User, Otp } = require('../models/UserModel');
const { generateToken, verifyToken } = require('../utils/jwt');

// Sign Up - Create new user
const signUp = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    // Send OTP after successful sign-up
    await sendOtp(req, res);

    res.status(201).send('User registered successfully. OTP sent to email.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during sign-up');
  }
};

// Send OTP
const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  // Generate a 6-digit OTP
  const otp = crypto.randomInt(100000, 999999);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry time

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User not found');
    }

    // Check if OTP already exists for this user
    let otpRecord = await Otp.findOne({ email });
    if (otpRecord) {
      otpRecord.otp = otp;
      otpRecord.expiresAt = expiresAt;
    } else {
      otpRecord = new Otp({ email, otp, expiresAt });
    }

    await otpRecord.save();

    // Send OTP via email using Nodemailer
    const subject = 'Your OTP Code';
    const text = `Your OTP code is: ${otp}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      text: text,
    };

    await nodemailerConfig.sendMail(mailOptions);
    res.status(200).send('OTP sent successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending OTP');
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).send('Email and OTP are required');
  }

  try {
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).send('Invalid OTP');
    }

    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).send('OTP has expired');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Mark OTP as verified
    user.otpVerified = true;
    await user.save();

    res.status(200).send('OTP verified successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error verifying OTP');
  }
};

// Reset OTP
const resetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Delete old OTP and generate a new one
    await Otp.deleteOne({ email });

    // Send new OTP
    await sendOtp(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error resetting OTP');
  }
};

// Sign In
const signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid password');
    }

    if (!user.otpVerified) {
      return res.status(400).send('OTP not verified');
    }

    // Generate JWT token
    const token = generateToken(user.email);
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error signing in');
  }
};

module.exports = { signUp, sendOtp, verifyOtp, resetOtp, signIn };
