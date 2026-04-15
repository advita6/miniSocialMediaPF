import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CreatePost() {
  const navigate = useNavigate();

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📸 Handle Image Upload
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // ❌ Remove Image
  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  // 🚀 Handle Post
  const handlePost = async () => {
    if (!caption && !image) {
      alert("Add something to post!");
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const formData = new FormData();
      formData.append("content", caption);
      if (user) formData.append("userId", user._id);
      if (image) formData.append("image", image);

      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user?.token || ""}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create post");
        return;
      }

      alert("Post created 🚀");

      // Reset
      setCaption("");
      setImage(null);
      setPreview(null);

      // Redirect
      navigate("/");
    } catch (err) {
      alert("Server error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-lg space-y-5"
      >

        {/* Title */}
        <h2 className="text-xl font-bold text-center">Create Post</h2>

        {/* Image Upload */}
        {!preview ? (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl h-48 cursor-pointer hover:border-blue-500 transition">
            <span className="text-zinc-400">Click to upload image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="preview"
              className="w-full rounded-xl"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-lg text-sm hover:bg-black"
            >
              ✖
            </button>
          </div>
        )}

        {/* Caption */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500 resize-none"
        />

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="text-zinc-400 hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={handlePost}
            disabled={loading}
            className="bg-blue-500 px-5 py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post 🚀"}
          </button>
        </div>

      </motion.div>
    </div>
  );
}