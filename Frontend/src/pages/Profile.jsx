import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaCamera, FaCheck } from "react-icons/fa";
import PostCard from "../components/PostCard";
import API_BASE from "../api";

export default function Profile() {
  const localUser = JSON.parse(localStorage.getItem("user")) || null;
  const [user, setUser] = useState(localUser);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${API_BASE}/api/posts`);
        const data = await res.json();
        const userPosts = data.filter(p => p.userId && p.userId._id === user._id);
        setPosts(userPosts);
      } catch (err) {
        console.error("Failed to fetch user posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserPosts();
  }, [user?._id]);

  const handlePFPClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });
      const updated = await res.json();
      if (res.ok) {
        const newUser = { ...user, ...updated };
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
      } else {
        alert(updated.message || "Failed to update profile picture");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div className="app-container pt-32 text-center font-black uppercase text-zinc-600">UNAUTHORIZED ACCESS</div>;

  return (
    <div className="app-container pt-20 sm:pt-24 pb-32">
      <div className="liquid-bg-wrapper opacity-30 fixed inset-0 z-0">
        <div className="liquid-bg-image" />
        <div className="liquid-overlay" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-10">
        
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-obsidian p-8 sm:p-16 rounded-[2.5rem] sm:rounded-[4rem] shadow-3xl mb-16 sm:mb-24 border border-white/5 relative overflow-hidden"
        >
          <div className="flex flex-col items-center">
            
            {/* PFP with Upload Logic */}
            <div className="relative mb-8 sm:mb-10 group cursor-pointer" onClick={handlePFPClick}>
              <div className="absolute inset-0 bg-amber-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              
              <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-zinc-900 border-4 border-white/5 overflow-hidden flex items-center justify-center">
                {user.profilePic ? (
                  <img src={user.profilePic.startsWith("http") ? user.profilePic : `${API_BASE}${user.profilePic}`} alt="PFP" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl sm:text-7xl font-black text-white font-chaotic italic">
                    {user.name[0]?.toUpperCase()}
                  </span>
                )}

                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <FaCamera size={24} className="mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Update Traces</span>
                </div>

                {uploading && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            <div className="text-center">
              <h2 className="text-5xl sm:text-7xl font-black text-white mb-2 tracking-tighter uppercase">
                {user.name}
              </h2>
              <p className="text-zinc-500 font-black tracking-[0.4em] uppercase text-[10px] mb-12 inline-block bg-white/5 px-6 py-2 rounded-full border border-white/5">
                {user.email}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
              <div className="bg-black/40 rounded-3xl p-8 sm:p-10 border border-white/5 shadow-inner text-center">
                <h3 className="font-black text-zinc-600 text-[10px] uppercase tracking-[0.4em] mb-3">Posts</h3>
                <p className="text-5xl sm:text-6xl font-black amber-text font-chaotic">{posts.length}</p>
              </div>
              <div className="bg-black/40 rounded-3xl p-8 sm:p-10 border border-white/5 shadow-inner text-center">
                <h3 className="font-black text-zinc-600 text-[10px] uppercase tracking-[0.4em] mb-3">Connection</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">SECURE</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feed Feed */}
        <div className="max-w-3xl mx-auto px-2">
          <div className="flex items-center gap-6 mb-12">
            <div className="h-px flex-1 bg-white/5"></div>
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] whitespace-nowrap">Archives</h3>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          
          {loading && (
            <div className="flex flex-col items-center pt-10">
              <div className="w-12 h-12 border-4 border-white/5 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
          )}
          
          {!loading && posts.length === 0 && (
            <div className="text-center glass-obsidian rounded-[3rem] border border-white/5 p-20">
              <p className="text-zinc-600 font-black tracking-widest text-[11px] uppercase">No trace found in the local sector.</p>
            </div>
          )}

          <div className="space-y-10">
            {posts.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
