// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();  // Ensure you're loading the environment variables

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;  // Get the MongoDB URI from .env

    if (!uri) {
      console.error('MongoDB URI is missing');
      process.exit(1);  // Exit the process if URI is missing
    }

    await mongoose.connect(uri);  // Remove the deprecated options

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);  // Exit the process in case of failure
  }
};

module.exports = connectDB;
