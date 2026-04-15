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

  // Fetch Reddit/meme posts once on mount
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
        console.error("Failed to fetch memes:", err);
        setExternalPosts([]);
      }
    };
    fetchExternal();
  }, []);

  // Fetch DB (user) posts and merge with reddit posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();
        // Mix user posts + reddit posts, reddit at top
        setPosts([...externalPosts, ...data]);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, [externalPosts]);

  // Scroll to & highlight post from notification link (?post=<id>)
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
    <div style={{ padding: "16px 12px" }}>
      {loading && (
        <p style={{ textAlign: "center", color: "#555", paddingTop: 60, fontSize: 14 }}>
          Loading posts...
        </p>
      )}
      {!loading && posts.length === 0 && (
        <p style={{ textAlign: "center", color: "#555", paddingTop: 60, fontSize: 14 }}>
          No posts yet. Be the first to create one!
        </p>
      )}

      <div className="columns-1 sm:columns-2 lg:columns-3" style={{ columnGap: 12 }}>
        {posts.map((p) => (
          <div key={p._id} style={{ breakInside: "avoid", marginBottom: 12 }}>
            <PostCard post={p} highlighted={highlightedPostId === p._id} />
          </div>
        ))}
      </div>
    </div>
  );
}