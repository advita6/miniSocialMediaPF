const Post = require("../data/Post");

exports.createPost = async (req, res) => {
  const { userId, content } = req.body;

  let imageUrl = null;
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  const post = new Post({ userId, content, image: imageUrl });
  await post.save();

  res.json(post);
};

exports.getPosts = async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
};
