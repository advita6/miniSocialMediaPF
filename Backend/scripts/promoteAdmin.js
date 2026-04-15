/**
 * Admin Promotion Utility
 * Usage: node scripts/promoteAdmin.js <email>
 */

const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const User = require("../data/User");

// Load .env from the parent directory
dotenv.config({ path: path.join(__dirname, "../.env") });

const promoteUser = async () => {
  const email = process.argv[2];

  if (!email) {
    console.error("Please provide an email address: node scripts/promoteAdmin.js <email>");
    process.exit(1);
  }

  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/socialx";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB...");

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email "${email}" not found.`);
      process.exit(1);
    }

    if (user.isAdmin) {
      console.log(`User "${email}" is already an admin.`);
    } else {
      user.isAdmin = true;
      await user.save();
      console.log(`Successfully promoted "${email}" to admin!`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error promoting user:", err.message);
    process.exit(1);
  }
};

promoteUser();
