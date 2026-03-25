const Post = require("../Models/Post");

exports.createPost = async (req, res) => {
  const { userId, content } = req.body;

  const post = new Post({ userId, content });
  await post.save();

  res.json(post);
};

exports.getPosts = async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
};
