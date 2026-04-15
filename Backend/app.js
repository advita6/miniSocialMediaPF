const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const chatSocketHandler = require("./chatroom/socketHandler");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket initialization
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  }
});
chatSocketHandler(io);

app.use(helmet());

// Global Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`Backend received: ${req.method} ${req.url}`);
  next();
});

const connectDB = require("./Database/connection");

// Import routes
const authRoutes = require("./api/authRoutes");
const postRoutes = require("./api/postRoutes");
const adminRoutes = require("./api/adminRoutes");
const notificationRoutes = require("./api/notificationRoutes");

const runServer = async () => {
  // Connect to MongoDB
  await connectDB();
  
  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/notifications", notificationRoutes);

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.get("/", (req, res) => {
    res.send("Server is running...");
  });

  // Error handling
  app.use((err, req, res, next) => {
    console.log("Error:", err);
    res.status(500).json({ message: "Something went wrong on the server" });
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
};

runServer();