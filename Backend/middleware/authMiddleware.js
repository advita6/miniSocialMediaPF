const jwt = require("jsonwebtoken");
const User = require("../data/User");

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from the token but leave out the password
      req.user = await User.findById(decoded.id).select("-password");
      
      next();
    } catch (error) {
      res.status(401).json({ message: "Login expired or token invalid" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "You need to be logged in to access this" });
  }
};

module.exports = { protect };