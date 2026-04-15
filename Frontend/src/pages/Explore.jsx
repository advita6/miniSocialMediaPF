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
    <div style={{ padding: "16px 12px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "0 4px" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.5px" }}>
            Explore
          </h1>
          <p style={{ fontSize: 13, color: "#555", margin: "4px 0 0" }}>
            Trending posts from Reddit
          </p>
        </div>
        <button
          onClick={fetchMemes}
          disabled={loading}
          style={{
            background: "#00D97E", border: "none", borderRadius: 12,
            padding: "9px 18px", color: "#000", fontWeight: 700,
            fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1, transition: "opacity 0.2s, transform 0.2s",
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "scale(1.04)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.1)",
            borderTopColor: "#00D97E",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <p style={{ textAlign: "center", color: "#555", paddingTop: 40, fontSize: 14 }}>
          Could not load posts. Check your connection and try refreshing.
        </p>
      )}

      {/* Masonry grid */}
      {!loading && !error && (
        <div className="columns-1 sm:columns-2 lg:columns-3" style={{ columnGap: 12 }}>
          {posts.map((p) => (
            <div key={p._id} style={{ breakInside: "avoid", marginBottom: 12 }}>
              <PostCard post={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
