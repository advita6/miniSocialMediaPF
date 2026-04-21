const express = require("express");
const router = express.Router();
const { signup, login, googleLogin } = require("../logic/authController");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, 
  message: "Too many attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/google", googleLogin);

module.exports = router;