import { useState } from "react";
import { motion } from "framer-motion";
import { FaHeart, FaRegComment, FaPaperPlane } from "react-icons/fa";

export default function PostCard({ post }) {
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const [likes, setLikes] = useState(post.likes || []);
  const [liked, setLiked] = useState(user ? (post.likes || []).includes(user._id) : false);
  const [showHeart, setShowHeart] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [loading, setLoading] = useState(false);

  const toggleLocalLike = async () => {
    if (!user) {
      alert("Please login to like");
      return;
    }
    
    // Optimistic update
    const isCurrentlyLiked = liked;
    setLiked(!isCurrentlyLiked);
    if (!isCurrentlyLiked) {
      setLikes([...likes, user._id]);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    } else {
      setLikes(likes.filter(id => id !== user._id));
    }

    try {
      await fetch(`/api/posts/${post._id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id })
      });
    } catch (err) {
      console.error("Like error:", err);
      // Revert if failed
      setLiked(isCurrentlyLiked);
      setLikes(post.likes);
    }
  };

  const handleDoubleClick = () => {
    if (!liked) toggleLocalLike();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        alert("Please login to comment");
        return;
      }

      const res = await fetch(`/api/posts/${post._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, text: commentText })
      });

      const updatedPost = await res.json();
      if (res.ok) {
        setComments(updatedPost.comments);
        setCommentText("");
      } else {
        alert(updatedPost.message || "Failed to add comment");
      }
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-sm">
      
      {/* Header */}
      <div className="p-4 font-semibold text-zinc-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs uppercase">
          {post.userId?.name?.[0] || "?"}
        </div>
        {post.userId?.name || "Anonymous"}
      </div>

      {/* Image */}
      {post.image && (
        <div className="relative" onDoubleClick={handleDoubleClick}>
          <img
            src={post.image.startsWith("/") ? post.image : post.image}
            alt=""
            className="w-full object-cover max-h-[600px]"
          />

          {/* ❤️ Animation */}
          {showHeart && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <FaHeart className="text-white text-6xl opacity-80" />
            </motion.div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex gap-5 text-xl">
          <FaHeart
            className={`cursor-pointer transition-colors duration-200 ${liked ? "text-red-500" : "text-zinc-400 hover:text-white"}`}
            onClick={toggleLocalLike}
          />
          <FaRegComment className="cursor-pointer text-zinc-400 hover:text-white transition-colors duration-200" />
        </div>
        {likes.length > 0 && (
          <div className="text-sm font-semibold text-zinc-200">
            {likes.length} {likes.length === 1 ? "like" : "likes"}
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="px-4 pb-2 text-sm text-zinc-300">
        <p>
          <span className="font-bold text-zinc-100 mr-2">{post.userId?.name || "Anonymous"}</span>{" "}
          {post.content}
        </p>
      </div>

      {/* Comments List */}
      <div className="px-4 pb-4 space-y-2 border-t border-zinc-800 mt-2 pt-4">
        {comments.map((c, i) => (
          <div key={i} className="text-sm">
             <span className="font-semibold text-zinc-200 mr-2">User {i+1}</span>
             <span className="text-zinc-400">{c.text}</span>
          </div>
        ))}

        {/* Add Comment Input */}
        <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-4 bg-zinc-800/50 p-2 rounded-lg border border-zinc-700/50">
          <input
            type="text"
            className="bg-transparent flex-1 outline-none text-sm px-2 text-zinc-200 placeholder:text-zinc-500"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="text-blue-500 hover:text-blue-400 disabled:opacity-50 transition-colors"
          >
            <FaPaperPaperPlane />
          </button>
        </form>
      </div>

    </div>
  );
}

function FaPaperPaperPlane() {
  return <FaPaperPlane />;
}