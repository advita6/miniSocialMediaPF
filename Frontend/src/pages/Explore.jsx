import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PostCard from "../components/PostCard";

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMemes = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("https://meme-api.com/gimme/12");
      const data = await res.json();
      const mapped = data.memes.map((item, index) => ({
        _id: `explore-${index}-${Date.now()}`,
        userId: { _id: `user-ext-${index}`, name: item.author },
        image: item.url,
        content: `${item.title} · r/${item.subreddit}`,
        likes: [],
        comments: [],
        isExternal: true,
        createdAt: null,
      }));
      setPosts(mapped);
    } catch (err) {
      console.error("Failed to fetch memes:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMemes(); }, []);

  return (
    <div className="app-container pt-24 pb-32">
      {/* Background Liquid Layer */}
      <div className="liquid-bg-wrapper opacity-40 fixed inset-0 z-0">
        <div className="liquid-bg-image" />
        <div className="liquid-overlay" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-16 px-2 gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl sm:text-7xl font-black uppercase tracking-tighter m-0"
            >
              MEME <span className="amber-text">SCAN.</span>
            </motion.h1>
            <p className="text-zinc-500 font-black tracking-[0.4em] text-[10px] uppercase mt-3">
              Cross Internet Dump
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={fetchMemes}
            disabled={loading}
            className="bg-amber-500 hover:bg-white text-black font-black text-xs uppercase tracking-widest px-10 py-5 rounded-3xl transition-all shadow-2xl disabled:opacity-50"
          >
            {loading ? "SCANNING…" : "REFRESH DUMP"}
          </motion.button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center pt-20 space-y-6">
            <div className="w-12 h-12 border-4 border-white/5 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-zinc-600 font-black tracking-widest text-[9px] uppercase animate-pulse">Synchronizing dump...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center pt-20 space-y-4">
            <p className="text-zinc-500 font-black tracking-widest text-xs uppercase">
              The void is unreachable. Retry later.
            </p>
          </div>
        )}

        {/* Masonry grid */}
        {!loading && !error && (
          <div className="columns-1 md:columns-2 xl:columns-3 gap-8">
            {posts.map((p) => (
              <div key={p._id} className="break-inside-avoid">
                <PostCard post={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
