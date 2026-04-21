const User = require("../data/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios"); // I'll need to install axios
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// JWT generator
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Handle user signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Handle user login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        token: generateToken(user._id),
        isAdmin: user.isAdmin || false
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { tokenId, isAccessToken } = req.body;
    if (!tokenId) return res.status(400).json({ message: "No token provided" });

    let email, name, picture;

    if (isAccessToken) {
      // If it's an access token from @react-oauth/google
      const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenId}`);
      email = googleRes.data.email;
      name = googleRes.data.name;
      picture = googleRes.data.picture;
    } else {
      // If it's an ID Token
      const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    }

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await User.create({ name, email, password: randomPassword, profilePic: picture });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic || picture,
      token: generateToken(user._id),
      isAdmin: user.isAdmin || false,
    });
  } catch (error) {
    console.error("Google Auth Error:", error.message);
    res.status(500).json({ message: "Google authentication failed" });
  }
};