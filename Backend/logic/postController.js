const Post = require("../data/Post");

exports.createPost = async (req, res) => {
  try {
    const { userId, content } = req.body;

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
    const posts = await Post.find().populate("userId", "name").sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { userId, text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = { userId, text };
    post.comments.push(newComment);
    await post.save();

    res.json(post);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: error.message });
  }
};
