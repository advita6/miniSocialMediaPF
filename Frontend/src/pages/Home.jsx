import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="flex justify-center mt-6 px-4">
      <div className="w-full max-w-2xl space-y-6">

        {/* Loading */}
        {loading && (
          <p className="text-center text-zinc-400">Loading posts...</p>
        )}

        {/* No posts */}
        {!loading && posts.length === 0 && (
          <p className="text-center text-zinc-500">No posts yet. Create one!</p>
        )}

        {/* 📸 Feed */}
        <div className="space-y-6">
          {posts.map((p) => (
            <PostCard key={p._id} post={p} />
          ))}
        </div>

      </div>
    </div>
  );
}