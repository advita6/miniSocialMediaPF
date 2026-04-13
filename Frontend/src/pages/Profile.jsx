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
    <div className="flex flex-col items-center mt-10 px-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl mb-8"
      >
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-6">
            {user.name && user.name[0] ? user.name[0].toUpperCase() : "?"}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
          <p className="text-zinc-400 mb-8">{user.email}</p>
          
          <div className="w-full bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 text-center">
            <h3 className="font-semibold text-zinc-200 border-b border-zinc-700 pb-2 mb-3">Posts Created</h3>
            <p className="text-2xl font-bold text-blue-400">{posts.length}</p>
          </div>
        </div>
      </motion.div>

      {/* User's Posts Feed */}
      <div className="w-full max-w-2xl space-y-6">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-zinc-800 pb-2">Your Posts</h3>
        
        {loading && <p className="text-center text-zinc-400">Loading posts...</p>}
        
        {!loading && posts.length === 0 && (
          <p className="text-center text-zinc-500">You haven't created any posts yet.</p>
        )}

        {posts.map((p) => (
          <PostCard key={p._id} post={p} />
        ))}
      </div>
    </div>
  );
}
