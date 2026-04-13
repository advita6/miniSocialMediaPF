const express = require("express");
const router = express.Router();
const User = require("../data/User");
const Post = require("../data/Post");
const { protect } = require("../middleware/authMiddleware");

// Admin protector middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

// Apply protect and adminOnly middleware to all admin routes
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/users
// @desc    Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      // Also delete all posts by this user
      await Post.deleteMany({ userId: user._id });
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/restrict
// @desc    Toggle user restriction
router.put("/users/:id/restrict", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isRestricted = !user.isRestricted;
      await user.save();
      res.json({ message: "User restriction status updated", isRestricted: user.isRestricted });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
