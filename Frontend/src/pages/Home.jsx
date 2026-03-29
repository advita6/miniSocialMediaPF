import { useState } from "react";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([
    { id: 1, user: "User_123", content: "First post 🔥", likes: 10 },
    { id: 2, user: "Anon_456", content: "Hello world!", likes: 4 },
    { id: 3, user: "abhi", content: "Gym grind 💪", likes: 7 },
    { id: 4, user: "coderX", content: "Late night coding 🌙", likes: 12 },
    { id: 5, user: "traveler", content: "Mountains calling 🏔️", likes: 20 }
  ]);

  return (
    <div className="flex justify-center mt-6 px-4">
      <div className="w-full max-w-2xl space-y-6">

        {/* 📸 Feed */}
        <div className="space-y-6">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>

      </div>
    </div>
  );
}