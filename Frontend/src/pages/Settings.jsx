import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaMoon, FaBell, FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const isLight = localStorage.getItem("theme") === "light";
    setDarkMode(!isLight);
    const notifs = localStorage.getItem("notifications") !== "disabled";
    setNotifications(notifs);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (!newDarkMode) {
      document.documentElement.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    }
  };

  const toggleNotifications = () => {
    const newVal = !notifications;
    setNotifications(newVal);
    localStorage.setItem("notifications", newVal ? "enabled" : "disabled");
  };

  return (
    <div className="app-container pt-24 pb-32">
      {/* Background Liquid Layer */}
      <div className="liquid-bg-wrapper opacity-30 fixed inset-0 z-0">
        <div className="liquid-bg-image" />
        <div className="liquid-overlay" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-3 text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest bg-transparent border-0"
        >
          <FaArrowLeft size={10} /> Back to Sector
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-obsidian p-10 sm:p-14 rounded-[3rem] shadow-3xl border border-white/5"
        >
          <h2 className="text-4xl font-black text-white mb-10 tracking-tighter uppercase font-chaotic italic border-b border-white/5 pb-6">
            Settings <span className="amber-text">Center</span>
          </h2>
          
          <div className="space-y-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-6 sm:p-8 bg-black/40 rounded-[2rem] border border-white/5 transition-all hover:border-amber-500/30">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl">
                  <FaMoon size={20} />
                </div>
                <div>
                  <p className="font-black text-white uppercase text-xs tracking-widest mb-1">Night Protocol</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Toggle system-wide dark mode</p>
                </div>
              </div>
              <div 
                onClick={toggleDarkMode}
                className={`w-14 h-8 rounded-full flex items-center p-1.5 cursor-pointer transition-all duration-500 ${darkMode ? 'bg-amber-500 shadow-[0_0_15px_rgba(255,140,0,0.4)]' : 'bg-zinc-800'}`}
              >
                <motion.div 
                  layout 
                  className={`w-5 h-5 rounded-full shadow-2xl transition-colors ${darkMode ? 'bg-white' : 'bg-zinc-500'}`}
                  animate={{ x: darkMode ? 24 : 0 }}
                />
              </div>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-6 sm:p-8 bg-black/40 rounded-[2rem] border border-white/5 transition-all hover:border-amber-500/30">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl">
                  <FaBell size={20} />
                </div>
                <div>
                  <p className="font-black text-white uppercase text-xs tracking-widest mb-1">Transmissions</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Manage alerts and notifications</p>
                </div>
              </div>
              <div 
                onClick={toggleNotifications}
                className={`w-14 h-8 rounded-full flex items-center p-1.5 cursor-pointer transition-all duration-500 ${notifications ? 'bg-amber-500 shadow-[0_0_15px_rgba(255,140,0,0.4)]' : 'bg-zinc-800'}`}
              >
                <motion.div 
                  layout 
                  className={`w-5 h-5 rounded-full shadow-2xl transition-colors ${notifications ? 'bg-white' : 'bg-zinc-500'}`}
                  animate={{ x: notifications ? 24 : 0 }}
                />
              </div>
            </div>
            
            {/* Security Node */}
            <div className="flex items-center justify-between p-6 sm:p-8 bg-black/40 rounded-[2rem] border border-white/5 transition-all hover:border-amber-500/30 cursor-pointer group">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <FaShieldAlt size={20} />
                </div>
                <div>
                  <p className="font-black text-white uppercase text-xs tracking-widest mb-1">Encryption Keys</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Advanced security and password sync</p>
                </div>
              </div>
              <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-4 py-2 rounded-full">
                Encrypted
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-[9px] text-zinc-700 font-black tracking-[0.5em] uppercase">V.1.0.0 // PROTOCOL_LIQUID</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
