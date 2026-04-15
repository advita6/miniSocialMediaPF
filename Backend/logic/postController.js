const Post = require("../data/Post");
const Notification = require("../data/Notification");

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Post content cannot be empty" });
    }

    if (content.length > 500) {
      return res.status(400).json({ message: "Post content is too long (max 500 characters)" });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const post = new Post({ userId, content, image: imageUrl });
    await post.save();

    res.json(post);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name")
      .populate("comments.userId", "name")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text cannot be empty" });
    }

    if (text.length > 200) {
      return res.status(400).json({ message: "Comment text is too long (max 200 characters)" });
    }
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({ userId, text });
    await post.save();

    if (post.userId.toString() !== userId.toString()) {
      await Notification.create({
        recipient: post.userId,
        sender: userId,
        type: "comment",
        post: post._id,
      });
    }

    // Re-fetch with populated usernames so the frontend gets real names
    const populatedPost = await Post.findById(post._id)
      .populate("userId", "name")
      .populate("comments.userId", "name");

    res.json(populatedPost);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user._id;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const hasLiked = post.likes.includes(userId);
    if (hasLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
      if (post.userId.toString() !== userId.toString()) {
        await Notification.create({
          recipient: post.userId,
          sender: userId,
          type: "like",
          post: post._id,
        });
      }
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isOwner = post.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin === true;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: error.message });
  }
};
