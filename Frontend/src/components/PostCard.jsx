import { useState } from "react";
import { motion } from "framer-motion";
import { FaHeart, FaRegComment } from "react-icons/fa";

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const handleDoubleClick = () => {
    setLiked(true);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      
      {/* Header */}
      <div className="p-3 font-semibold">{post.user}</div>

      {/* Image */}
      <div className="relative" onDoubleClick={handleDoubleClick}>
        <img
          src="https://via.placeholder.com/500"
          alt=""
          className="w-full"
        />

        {/* ❤️ Animation */}
        {showHeart && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <FaHeart className="text-white text-6xl opacity-80" />
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 flex gap-4">
        <FaHeart
          className={`cursor-pointer ${liked ? "text-red-500" : ""}`}
          onClick={() => setLiked(!liked)}
        />
        <FaRegComment className="cursor-pointer" />
      </div>

      {/* Caption */}
      <div className="px-3 pb-3 text-sm">
        <p>
          <span className="font-semibold">{post.user}</span> {post.content}
        </p>
      </div>

    </div>
  );
}