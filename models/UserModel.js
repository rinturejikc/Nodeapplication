// models/UserModel.js
const mongoose = require('mongoose');

// Create a User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user'  
  }
}, {
  timestamps: true
});

// Create and export the User model
module.exports = mongoose.model('User', userSchema);
