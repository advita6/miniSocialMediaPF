const express = require("express");
const router = express.Router();
const { signup, login } = require("../logic/authController");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 requests per 15 mins
  message: "Too many login/signup attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);

module.exports = router;