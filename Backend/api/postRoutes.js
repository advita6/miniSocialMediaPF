const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Import logic controllers
const { 
    createPost, 
    getPosts, 
    addComment, 
    toggleLike,
    deletePost
} = require("../logic/postController");

// Import the security middleware
const { protect } = require("../middleware/authMiddleware");

// Ensure upload directory exists locally
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Unique filename: Timestamp + Random Number + Original Extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit: 5MB
});

/**
 * ROUTES
 */

// 1. Create Post: Protected + Image Upload
// Note: 'protect' must come before 'upload' to verify user identity first
router.post("/create", protect, upload.single("image"), createPost);

// 2. Get All Posts: Public (allows guests to see the feed)
router.get("/", getPosts);

// 3. Add Comment: Protected
router.post("/:id/comment", protect, addComment);

// 4. Toggle Like: Protected
router.post("/:id/like", protect, toggleLike);

// 5. Delete Post: Protected (owner or admin)
router.delete("/:id", protect, deletePost);

module.exports = router;