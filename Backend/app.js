const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());   

const authRoutes = require("./Routes/authRoutes");
const postRoutes = require("./Routes/postRoutes");
const connectDB = require("./Config/db");

connectDB();

app.use("/api/auth", authRoutes);  
app.use("/api/posts", postRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(5000, () => console.log("Server running on port 5000"));