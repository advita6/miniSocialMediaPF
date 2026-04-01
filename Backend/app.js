const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

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

  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postRoutes);

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.get("/", (req, res) => {
    res.send("API running");
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();