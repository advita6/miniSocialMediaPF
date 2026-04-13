const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  bio: String,
  profilePic: String,
  isAdmin: { type: Boolean, default: false },
  isRestricted: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);