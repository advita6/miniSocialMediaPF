const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());   

const authRoutes = require("./api/authRoutes");
const postRoutes = require("./api/postRoutes");
const connectDB = require("./setup/db");

connectDB();

app.use("/api/auth", authRoutes);  
app.use("/api/posts", postRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(5000, () => console.log("Server running on port 5000"));