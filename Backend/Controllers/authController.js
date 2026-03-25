const User = require("../Models/User");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  const user = new User({ name, email, password });
  await user.save();

  res.json(user);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  res.json(user);
};