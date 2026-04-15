import { useState } from "react";
import { motion } from "framer-motion";
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
    <div
      id={`post-${post._id}`}
      style={{
        background: "#181818",
        border: highlighted ? "1px solid #6366F1" : "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20,
        overflow: "hidden",
        scrollMarginTop: 80,
        boxShadow: highlighted ? "0 0 24px rgba(99,102,241,0.35)" : "none",
        transition: "border-color 0.7s, box-shadow 0.7s",
      }}
    >
      {/* Post Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* User Avatar */}
          <div style={{
            width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg, ${gStart}, ${gEnd})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 17, color: "white",
            userSelect: "none",
          }}>
            {authorName[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: "white", margin: 0, lineHeight: 1.3 }}>
              {authorName}
            </p>
            <p style={{ fontSize: 12, color: "#555", margin: 0, lineHeight: 1.3 }}>
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Delete option */}
        {user && !post.isExternal &&
          ((post.userId?._id === user._id) || user.isAdmin) && (
            <button onClick={handleDelete}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#444", padding: 4, transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
            >
              <FaTrash size={13} />
            </button>
          )}
      </div>

      {/* Post text content */}
      {post.content && (
        <p style={{ padding: "0 16px 12px", fontSize: 14, color: "#C9CDD4", lineHeight: 1.55, margin: 0 }}>
          {post.content}
        </p>
      )}

      {/* Post image */}
      {post.image && (
        <div
          onDoubleClick={toggleLike}
          style={{ position: "relative", margin: "0 12px 12px", borderRadius: 14, overflow: "hidden" }}
        >
          <img src={post.image} alt="" style={{ width: "100%", display: "block" }} />
          {showHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.55 }}
              style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <FaHeart style={{ color: "white", fontSize: 64, filter: "drop-shadow(0 0 12px rgba(255,255,255,0.5))" }} />
            </motion.div>
          )}
        </div>
      )}

      {/* Buttons (Like, Comment) */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "4px 16px 14px" }}>
        <button onClick={toggleLike}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: liked ? "#FF354C" : "#555", transition: "color 0.2s",
          }}
        >
          <FaHeart size={17} />
          <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{likes.length}</span>
        </button>

        <button onClick={() => setShowComments((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: showComments ? "white" : "#555", transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#aaa")}
          onMouseLeave={(e) => (e.currentTarget.style.color = showComments ? "white" : "#555")}
        >
          <FaRegCommentAlt size={16} />
          <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{comments.length}</span>
        </button>

        <div style={{ flex: 1 }} />
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "12px 16px 16px" }}>
          {comments.length > 0 && (
            <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {comments.map((c, i) => (
                <div key={i} style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: "#E5E7EB", marginRight: 6 }}>
                    {c.userId?.name || "Anonymous"}
                  </span>
                  <span style={{ color: "#9CA3AF" }}>{c.text}</span>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleAddComment} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              autoComplete="off"
              style={{
                flex: 1, background: "#111",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: "9px 12px",
                color: "white", fontSize: 13, outline: "none",
              }}
            />
            <button type="submit" disabled={loading}
              style={{
                background: "#00D97E", border: "none", borderRadius: 12,
                padding: "9px 16px", cursor: loading ? "not-allowed" : "pointer",
                color: "#000", fontWeight: 700, fontSize: 13,
                opacity: loading ? 0.6 : 1, transition: "opacity 0.2s",
              }}
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}