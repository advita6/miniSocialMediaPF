import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [externalPosts, setExternalPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const scrolledRef = useRef(false);

  // Get some memes from external api to show on home page
  useEffect(() => {
    const fetchExternal = async () => {
      try {
        const res = await fetch("https://meme-api.com/gimme/3");
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

  // Get user posts from our backend and mix them with memes
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();
        // Combining external memes and our database posts
        setPosts([...externalPosts, ...data]);
      } catch (err) {
        console.error("error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    // Refresh the feed every 10 seconds
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, [externalPosts]);

  // If we came from a notification, scroll to that specific post
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
    <div className="px-4 py-2 max-w-7xl mx-auto">
      {loading && (
        <div className="flex flex-col items-center pt-24 space-y-4">
          <div className="w-12 h-12 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-medium text-sm animate-pulse">
            Curating your feed...
          </p>
        </div>
      )}
      {!loading && posts.length === 0 && (
        <div className="flex flex-col items-center pt-24 space-y-4">
          <div className="text-6xl opacity-50">🪴</div>
          <p className="text-zinc-500 font-medium text-sm">
            Nothing to see here yet! Try following some users.
          </p>
        </div>
      )}

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
        {posts.map((p) => (
          <div key={p._id} className="break-inside-avoid">
            <PostCard post={p} highlighted={highlightedPostId === p._id} />
          </div>
        ))}
      </div>
    </div>
  );
}