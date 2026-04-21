import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import PostCard from "../components/PostCard";
import API_BASE from "../api";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [externalPosts, setExternalPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const scrolledRef = useRef(false);

  useEffect(() => {
    const fetchExternal = async () => {
      try {
        const res = await fetch("https://meme-api.com/gimme/5");
        const data = await res.json();
        const mapped = data.memes.map((item, index) => ({
          _id: `external-${index}-${Date.now()}`,
          userId: { _id: `user-ext-${index}`, name: item.author },
          image: item.url,
          content: `${item.title} · r/${item.subreddit}`,
          likes: [],
          comments: [],
          isExternal: true,
        }));
        setExternalPosts(mapped);
      } catch (err) {
        console.error("error fetching memes:", err);
        setExternalPosts([]);
      }
    };
    fetchExternal();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const data = await res.json();
        setPosts([...externalPosts, ...data]);
      } catch (err) {
        console.error("error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    const interval = setInterval(fetchPosts, 15000);
    return () => clearInterval(interval);
  }, [externalPosts]);

  useEffect(() => {
    const targetPostId = searchParams.get("post");
    if (!targetPostId || loading || scrolledRef.current) return;
    const el = document.getElementById(`post-${targetPostId}`);
    if (el) {
      scrolledRef.current = true;
      setHighlightedPostId(targetPostId);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightedPostId(null), 3000);
      setSearchParams({});
    }
  }, [posts, loading, searchParams, setSearchParams]);

  return (
    <div className="app-container pt-24 pb-32">
      {/* Background Liquid Layer */}
      <div className="liquid-bg-wrapper opacity-50 fixed inset-0 z-0">
        <div className="liquid-bg-image" />
        <div className="liquid-overlay" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6">
        {/* Editorial Heading */}
        <div className="mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl sm:text-8xl font-black uppercase tracking-tighter"
          >
            THE <span className="amber-text">CURRENT.</span>
          </motion.h2>
          <p className="text-zinc-500 font-black tracking-widest text-xs uppercase mt-2">
            Transmission Feed // Unfiltered Chaos
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center pt-24 space-y-6">
            <div className="w-16 h-16 border-4 border-white/5 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-zinc-600 font-black tracking-[0.3em] text-[10px] uppercase animate-pulse">
              SYNCING WITH THE VOID...
            </p>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center pt-24 space-y-4">
            <p className="text-zinc-600 font-black tracking-widest text-xs uppercase">
              The hunt is quiet. Too quiet.
            </p>
          </div>
        )}

        <div className="columns-1 md:columns-2 xl:columns-3 gap-8">
          {posts.map((p) => (
            <div key={p._id} className="break-inside-avoid">
              <PostCard post={p} highlighted={highlightedPostId === p._id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}