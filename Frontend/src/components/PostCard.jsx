import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaRegCommentAlt, FaTrash } from "react-icons/fa";
import API_BASE from "../api";

// Helper to show how long ago a post was made
function timeAgo(date) {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "JUST NOW";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}M AGO`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}H AGO`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}D AGO`;
  return new Date(date).toLocaleDateString();
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
    
    if (post.isExternal) return;

    try {
      await fetch(`${API_BASE}/api/posts/${post._id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token || ""}` },
        body: JSON.stringify({ userId: user._id }),
      });
    } catch {
      setLiked(wasLiked);
      setLikes(post.likes);
    }
  };

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
      
      const res = await fetch(`${API_BASE}/api/posts/${post._id}/comment`, {
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

  const handleDelete = async () => {
    if (!window.confirm("Terminate this transmission?")) return;
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(`${API_BASE}/api/posts/${post._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${u?.token || ""}` },
      });
      if (res.ok) {
        setIsDeleted(true);
      } else { 
        const d = await res.json(); 
        alert(d.message || "Failed to terminate"); 
      }
    } catch (err) { 
      console.error("error deleting post:", err); 
    }
  };

  if (isDeleted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-obsidian group relative flex flex-col rounded-3xl overflow-hidden transition-all duration-700 mb-6 border border-white/5 ${
        highlighted ? "ring-2 ring-amber-500/50 shadow-[0_0_40px_rgba(255,140,0,0.2)]" : "hover:border-white/10 hover:shadow-3xl"
      }`}
    >
      {/* Post Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-4">
          {/* Obsidian Avatar */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center font-black text-white border border-white/10 shadow-inner">
            {authorName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-black text-[14px] text-white m-0 tracking-tight uppercase">
              {authorName}
            </p>
            <p className="text-[10px] text-zinc-500 m-0 mt-1 font-black tracking-widest uppercase">
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        {user && !post.isExternal && ((post.userId?._id === user._id) || user.isAdmin) && (
          <button 
            onClick={handleDelete}
            className="text-zinc-600 hover:text-red-500 p-2 transition-colors"
          >
            <FaTrash size={12} />
          </button>
        )}
      </div>

      {/* Post text content */}
      {post.content && (
        <p className="px-6 pb-4 text-[15px] text-zinc-300 leading-relaxed m-0 font-medium italic">
          "{post.content}"
        </p>
      )}

      {/* Post image with Liquid Zoom */}
      {post.image && (
        <div
          onDoubleClick={toggleLike}
          className="relative mx-4 mb-4 rounded-2xl overflow-hidden cursor-pointer border border-white/5"
        >
          <img 
            src={post.image} 
            alt="" 
            className="w-full block hover:scale-105 transition-transform duration-1000 ease-out" 
          />
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <FaHeart className="text-amber-500 text-8xl drop-shadow-[0_0_30px_rgba(255,140,0,0.8)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-8 px-8 py-2 pb-6">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={toggleLike}
          className={`flex items-center gap-2 group transition-all ${liked ? "text-amber-500" : "text-zinc-500 hover:text-white"}`}
        >
          <FaHeart size={18} className={`transition-transform duration-500 ${liked ? "scale-125" : "group-hover:scale-110"}`} />
          <span className="text-xs font-black tracking-widest">{likes.length}</span>
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowComments((v) => !v)}
          className={`flex items-center gap-2 transition-all ${showComments ? "text-white" : "text-zinc-500 hover:text-white"}`}
        >
          <FaRegCommentAlt size={17} />
          <span className="text-xs font-black tracking-widest">{comments.length}</span>
        </motion.button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/40"
          >
            <div className="p-6">
              {comments.length > 0 && (
                <div className="mb-6 flex flex-col gap-4">
                  {comments.map((c, i) => (
                    <div key={i} className="text-[13px] leading-snug flex gap-3">
                      <span className="font-black text-amber-500 uppercase text-[10px] tracking-widest min-w-[60px]">
                        {c.userId?.name || "ANON"}
                      </span>
                      <span className="text-zinc-400 font-medium italic">"{c.text}"</span>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleAddComment} className="flex gap-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="ADD TO THE CHAOS..."
                  className="flex-1 bg-zinc-950 border border-white/10 rounded-2xl px-5 py-3 text-white text-xs font-bold tracking-widest outline-none focus:border-amber-500/50 transition-all placeholder-zinc-700 uppercase"
                />
                <button 
                  type="submit" 
                  disabled={loading || !commentText.trim()}
                  className="bg-amber-500 hover:bg-white text-black disabled:bg-zinc-800 disabled:text-zinc-500 rounded-2xl px-6 font-black text-xs uppercase tracking-widest transition-all"
                >
                  POST
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}