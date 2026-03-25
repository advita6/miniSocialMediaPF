const express = require("express");
const app = express();

app.use(express.json());   

const authRoutes = require("./Routes/authRoutes");
const postRoutes = require("./Routes/postRoutes");
const connectDB = require("./Config/db");

connectDB();

app.use("/api/auth", authRoutes);  
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(5000, () => console.log("Server running on port 5000"));