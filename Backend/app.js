const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const chatSocketHandler = require("./chatroom/socketHandler");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  }
});
chatSocketHandler(io);

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

const connectDB = require("./Database/connection");

const startServer = async () => {
  await connectDB();
  
  const authRoutes = require("./api/authRoutes");
  const postRoutes = require("./api/postRoutes");
  const adminRoutes = require("./api/adminRoutes");
  const notificationRoutes = require("./api/notificationRoutes");

  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/notifications", notificationRoutes);

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.get("/", (req, res) => {
    res.send("API running");
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();