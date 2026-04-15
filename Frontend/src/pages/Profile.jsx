import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PostCard from "../components/PostCard";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Unknown", email: "No email" };
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();
        // Filter posts to only show current user's posts
        const userPosts = data.filter(p => p.userId && p.userId._id === user._id);
        setPosts(userPosts);
      } catch (err) {
        console.error("Failed to fetch user posts:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user._id) {
      fetchUserPosts();
    } else {
      setLoading(false);
    }
  }, [user._id]);

  return (
    <div className="flex flex-col items-center mt-10 px-4 w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg glass-panel p-8 rounded-[2rem] shadow-2xl mb-12 relative overflow-hidden"
      >
        {/* Decorative background glow inside the card */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none"></div>

        <div className="flex flex-col items-center relative z-10">
          {/* Avatar with glow */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-50"></div>
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-5xl font-extrabold text-white shadow-xl border-4 border-zinc-900/50">
              {user.name && user.name[0] ? user.name[0].toUpperCase() : "?"}
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight">{user.name}</h2>
          <p className="text-zinc-400 font-medium mb-8 bg-zinc-800/50 px-4 py-1.5 rounded-full border border-white/5 text-[13px]">
            {user.email}
          </p>
          
          <div className="w-full bg-zinc-950/40 rounded-2xl p-5 border border-white/5 text-center shadow-inner">
            <h3 className="font-semibold text-zinc-400 text-sm uppercase tracking-wider mb-2">Posts Created</h3>
            <p className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {posts.length}
            </p>
          </div>
        </div>
      </motion.div>

      {/* User's Posts Feed */}
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white tracking-tight">Your Posts</h3>
        </div>
        
        {loading && (
          <div className="flex flex-col items-center pt-10 space-y-4">
            <div className="w-10 h-10 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-medium text-sm animate-pulse">Loading posts...</p>
          </div>
        )}
        
        {!loading && posts.length === 0 && (
          <div className="text-center bg-white/5 rounded-2xl border border-white/5 p-12">
            <div className="text-5xl opacity-50 mb-4">📭</div>
            <p className="text-zinc-400 font-medium">You haven't created any posts yet.</p>
          </div>
        )}

        <div className="space-y-6">
          {posts.map((p) => (
            <PostCard key={p._id} post={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
