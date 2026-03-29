const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://Advita:1234@cluster0.n7tw5v6.mongodb.net/socialmedia");
    console.log("DB connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;