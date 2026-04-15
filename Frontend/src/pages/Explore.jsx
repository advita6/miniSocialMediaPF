import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMemes = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("https://meme-api.com/gimme/9");
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
    <div className="px-4 py-2 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h1 className="text-3xl font-extrabold m-0 tracking-tight bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">
            Explore
          </h1>
          <p className="text-[14px] text-zinc-400 mt-1 font-medium">
            Trending posts from across the internet
          </p>
        </div>
        <button
          onClick={fetchMemes}
          disabled={loading}
          className="bg-zinc-800/80 backdrop-blur-md border border-white/10 hover:border-white/20 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center pt-20">
          <div className="w-10 h-10 border-4 border-white/10 border-t-rose-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center pt-20 space-y-4">
          <div className="text-5xl opacity-50">💔</div>
          <p className="text-zinc-500 font-medium text-sm">
            Could not load posts. Check your connection.
          </p>
        </div>
      )}

      {/* Masonry grid */}
      {!loading && !error && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
          {posts.map((p) => (
            <div key={p._id} className="break-inside-avoid">
              <PostCard post={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
