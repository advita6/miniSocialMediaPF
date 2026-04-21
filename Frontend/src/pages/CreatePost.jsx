import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiPlus, FiArrowRight } from "react-icons/fi";
import API_BASE from "../api";

export default function CreatePost() {
  const navigate = useNavigate();

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handlePost = async () => {
    if (!caption && !image) {
      alert("Add something to post!");
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const formData = new FormData();
      formData.append("content", caption);
      if (user) formData.append("userId", user._id);
      if (image) formData.append("image", image);

      const res = await fetch(`${API_BASE}/api/posts/create`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${user?.token || ""}` },
        body: formData
      });

      if (res.ok) {
        navigate("/");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create post");
      }
    } catch (err) {
      alert("Server error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container pt-32 pb-40">
      {/* Background Liquid Layer */}
      <div className="liquid-bg-wrapper opacity-40 fixed inset-0 z-0">
        <div className="liquid-bg-image" />
        <div className="liquid-overlay" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-obsidian p-10 sm:p-14 rounded-[3.5rem] shadow-3xl border border-white/5"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-4xl font-black text-white m-0 tracking-tighter uppercase italic font-chaotic">
                NEW <span className="amber-text">INJECTION.</span>
              </h2>
              <p className="text-[10px] text-zinc-500 font-black tracking-[0.4em] uppercase mt-3">
                Prepare Transmission
              </p>
            </div>
            <button 
              onClick={() => navigate("/")}
              className="p-3 bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="space-y-8">
            {/* Image Upload Area */}
            {!preview ? (
              <label className="group relative flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2.5rem] h-64 cursor-pointer hover:border-amber-500/50 hover:bg-white/5 transition-all overflow-hidden bg-black/20">
                <div className="flex flex-col items-center group-hover:scale-110 transition-transform duration-500">
                  <div className="p-5 bg-amber-500/10 text-amber-500 rounded-2xl mb-4">
                    <FiPlus size={28} />
                  </div>
                  <span className="text-[11px] text-zinc-500 font-black tracking-widest uppercase">Upload Visual Trace</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 group">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full object-cover max-h-[400px] group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all"></div>
                <button
                  onClick={removeImage}
                  className="absolute top-4 right-4 bg-black/60 p-3 rounded-full text-white hover:bg-red-500 transition-all shadow-2xl backdrop-blur-md"
                >
                  <FiX size={20} />
                </button>
              </div>
            )}

            {/* Caption Input */}
            <div className="space-y-3">
              <label className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.5em] ml-6">Encryption Key / Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="WHAT'S THE CHAOS?..."
                className="w-full bg-black/40 border border-white/5 rounded-3xl p-8 text-white text-[15px] font-bold tracking-tight outline-none focus:border-amber-500/50 transition-all placeholder-zinc-800 resize-none h-40 uppercase"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handlePost}
                disabled={loading}
                className="flex-1 bg-white hover:bg-amber-500 text-black disabled:bg-zinc-900 disabled:text-zinc-700 rounded-3xl py-6 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-3xl flex items-center justify-center gap-3 group"
              >
                {loading ? "INJECTING..." : (
                  <>
                    INJECT TRANSMISSION
                    <FiArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[9px] text-zinc-700 font-black tracking-[0.5em] uppercase">Security Level: High // Latency: Low</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}