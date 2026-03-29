import { useState } from "react";

export default function CreatePostBox() {
  const [text, setText] = useState("");

  return (
    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full bg-transparent outline-none resize-none text-white"
      />

      <div className="flex justify-between items-center mt-3">
        <button className="text-sm text-zinc-400 hover:text-white">
          📷 Add Photo
        </button>

        <button className="bg-blue-500 px-4 py-1 rounded-lg hover:bg-blue-600">
          Post
        </button>
      </div>

    </div>
  );
}