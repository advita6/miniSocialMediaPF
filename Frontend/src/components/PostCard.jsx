import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaRegCommentAlt, FaTrash } from "react-icons/fa";

// Helper to show how long ago a post was made
function timeAgo(date) {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

const GRADIENTS = [
  ["#FF6B8A", "#FF354C"],
  ["#4ECDC4", "#2BB5AD"],
  ["#A855F7", "#7C3AED"],
  ["#F97316", "#EA580C"],
  ["#00D97E", "#00B364"],
  ["#3B82F6", "#2563EB"],
  ["#EC4899", "#DB2777"],
  ["#EAB308", "#CA8A04"],
];

function avatarGradient(name) {
  const i = (name || "A").charCodeAt(0) % GRADIENTS.length;
  return GRADIENTS[i];
}

export default function PostCard({ post, highlighted = false }) {
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const [likes, setLikes] = useState(post.likes || []);
  const [liked, setLiked] = useState(user ? (post.likes || []).includes(user._id) : false);
  const [showHeart, setShowHeart] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [loading, setLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const authorName = post.userId?.name || "Anonymous";
  const [gStart, gEnd] = avatarGradient(authorName);

  // Toggle like status
  const toggleLike = async () => {
    if (!user) { alert("Please login to like"); return; }
    const wasLiked = liked;
    setLiked(!wasLiked);
    if (!wasLiked) {
      setLikes((l) => [...l, user._id]);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 700);
    } else {
      setLikes((l) => l.filter((id) => id !== user._id));
    }
    
    // External memes aren't saved to our db
    if (post.isExternal) return;

    try {
      await fetch(`/api/posts/${post._id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token || ""}` },
        body: JSON.stringify({ userId: user._id }),
      });
    } catch {
      // rollback if it fails
      setLiked(wasLiked);
      setLikes(post.likes);
    }
  };

  // Add a comment to the post
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      if (!u) { alert("Please login to comment"); return; }
      
      if (post.isExternal) {
        setComments((c) => [...c, { text: commentText, userId: u }]);
        setCommentText(""); 
        setLoading(false); 
        return;
      }
      
      const res = await fetch(`/api/posts/${post._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${u?.token || ""}` },
        body: JSON.stringify({ userId: u._id, text: commentText }),
      });
      const updated = await res.json();
      if (res.ok) { 
        setComments(updated.comments); 
        setCommentText(""); 
      } else {
        alert(updated.message || "Failed to add comment");
      }
    } catch (err) { 
      console.error("error adding comment:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  // Delete the post (admin or author)
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${u?.token || ""}` },
      });
      if (res.ok) {
        setIsDeleted(true);
      } else { 
        const d = await res.json(); 
        alert(d.message || "Failed to delete"); 
      }
    } catch (err) { 
      console.error("error deleting post:", err); 
    }
  };

  if (isDeleted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      id={`post-${post._id}`}
      className={`glass-panel group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500 mb-4 ${
        highlighted ? "ring-2 ring-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]" : "hover:shadow-2xl hover:border-zinc-700/80"
      }`}
      style={{ scrollMarginTop: 80 }}
    >
      {/* Post Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <div 
            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg text-white shadow-inner"
            style={{ background: `linear-gradient(135deg, ${gStart}, ${gEnd})`, userSelect: "none" }}
          >
            {authorName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-[15px] text-zinc-100 m-0 leading-tight tracking-tight">
              {authorName}
            </p>
            <p className="text-[12px] text-zinc-400 m-0 leading-tight mt-0.5">
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Delete option */}
        {user && !post.isExternal && ((post.userId?._id === user._id) || user.isAdmin) && (
          <button 
            onClick={handleDelete}
            className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-colors"
          >
            <FaTrash size={13} />
          </button>
        )}
      </div>

      {/* Post text content */}
      {post.content && (
        <p className="px-5 pb-3 text-[14px] text-zinc-300 leading-relaxed m-0 font-medium">
          {post.content}
        </p>
      )}

      {/* Post image */}
      {post.image && (
        <div
          onDoubleClick={toggleLike}
          className="relative mx-3 mb-3 rounded-xl overflow-hidden cursor-pointer"
        >
          <img src={post.image} alt="" className="w-full block hover:scale-[1.02] transition-transform duration-700 ease-in-out" />
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 1, rotate: -15 }}
                animate={{ scale: 1.8, opacity: 0, rotate: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <FaHeart className="text-white text-7xl drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Buttons (Like, Comment) */}
      <div className="flex items-center gap-6 px-5 py-2 pb-4">
        <motion.button 
          whileTap={{ scale: 0.85 }}
          onClick={toggleLike}
          className={`flex items-center gap-2 group transition-colors ${liked ? "text-rose-500" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          <FaHeart size={18} className={`transition-transform duration-300 ${liked ? "scale-110" : "group-hover:scale-110"}`} />
          <span className="text-[13px] font-semibold">{likes.length}</span>
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.85 }}
          onClick={() => setShowComments((v) => !v)}
          className={`flex items-center gap-2 transition-colors ${showComments ? "text-indigo-400" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          <FaRegCommentAlt size={17} />
          <span className="text-[13px] font-semibold">{comments.length}</span>
        </motion.button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-4 px-5">
              {comments.length > 0 && (
                <div className="mb-4 flex flex-col gap-3">
                  {comments.map((c, i) => (
                    <div key={i} className="text-[13px] leading-snug">
                      <span className="font-bold text-zinc-200 mr-2">
                        {c.userId?.name || "Anonymous"}
                      </span>
                      <span className="text-zinc-400">{c.text}</span>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleAddComment} className="flex gap-2 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  autoComplete="off"
                  className="flex-1 bg-zinc-900 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 text-[13px] outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-600"
                />
                <button 
                  type="submit" 
                  disabled={loading || !commentText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white border-0 rounded-xl px-5 font-bold text-[13px] transition-all"
                >
                  Post
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}