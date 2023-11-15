const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = async () => {
  try {
    const DB_URI = process.env.DB_URI
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the application on connection error
  }
};

module.exports = connectToDatabase;
