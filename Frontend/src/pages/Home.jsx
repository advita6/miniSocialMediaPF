import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        let data = await res.json();
        
        // Fetch external mock posts from Picsum
        const mockRes = await fetch(`https://picsum.photos/v2/list?page=${Math.floor(Math.random() * 10) + 1}&limit=5`);
        const mockData = await mockRes.json();
        
        // Map mock data to our Post schema format
        const externalPosts = mockData.map(item => ({
          _id: `external-${item.id}-${Date.now()}`,
          userId: { _id: `user-${item.id}`, name: item.author },
          image: item.download_url,
          content: `Captured by ${item.author} 📸 #explore #photography`,
          likes: [],
          comments: [],
          isExternal: true // Custom flag in case we want to restrict interactions
        }));

        // Combine DB posts and mock posts
        setPosts([...data, ...externalPosts]);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    // Poll for new posts every 10 seconds
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
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