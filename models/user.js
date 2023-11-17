const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: false,
    trim: true,
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
  },
  mobile: {
    type: String,
    required: false,
    trim: false,
  },
  password: {
    type: String,
    required: false,
  },
  // Add the image field
  image: {
    type: String, // Assuming you store the image URL as a string
    required: false,
  },
});

// Hash the password before saving to the database
userSchema.pre('save', async function (next) {
  try {
    // Check if the password field is being modified
    if (!this.isModified('password')) {
      return next(); // Skip hashing if the password is not modified
    }

    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
