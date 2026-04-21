import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome, FaCompass, FaPlus, FaComments, FaUser,
  FaBell, FaSignOutAlt, FaCog, FaShieldAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import API_BASE from "../api";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const notificationsRef = useRef(null);
  const profileMenuRef = useRef(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) return;
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/notifications`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.read).length);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetch_();
    const id = setInterval(fetch_, 15000);
    return () => clearInterval(id);
  }, []);

  const handleNotificationsClick = async () => {
    setShowNotifications((v) => !v);
    if (!showNotifications && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      try {
        await fetch(`${API_BASE}/api/notifications/read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${user.token}` },
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target))
        setShowNotifications(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const bottomItems = [
    { path: "/", icon: <FaHome size={20} />, id: "home" },
    { path: "/explore", icon: <FaCompass size={20} />, id: "explore" },
    { path: "/create", icon: <FaPlus size={22} />, id: "create", special: true },
    { path: "/chat", icon: <FaComments size={22} />, id: "chat", highlighted: true },
  ];

  return (
    <>
      {/* --- TOP BAR --- */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 sm:px-10 glass-obsidian border-b border-white/5 shadow-2xl">
        
        {/* New Minimalist Liquid Logo */}
        <Link to="/" className="flex items-center gap-3 no-underline group">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:rotate-12 transition-transform duration-500">
            <path d="M10 10L30 30" stroke="white" strokeWidth="6" strokeLinecap="round" className="amber-glow-path" />
            <path d="M30 10L10 30" stroke="#FF8C00" strokeWidth="6" strokeLinecap="round" />
            <circle cx="20" cy="20" r="4" fill="white" className="animate-pulse" />
          </svg>
          <span className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase font-chaotic hidden xs:block">
            Social<span className="amber-text">X</span>
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={handleNotificationsClick}
              className={`w-10 h-10 sm:w-11 h-11 rounded-full flex items-center justify-center border border-white/5 transition-all ${
                showNotifications ? "bg-amber-500 text-black" : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <FaBell size={14} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-black">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute top-[calc(100%+12px)] right-0 w-72 sm:w-85 glass-obsidian rounded-3xl shadow-3xl overflow-hidden z-50 border border-white/10"
                >
                  <div className="px-6 py-4 border-b border-white/5 font-black text-[10px] uppercase tracking-widest text-zinc-400">
                    Transmissions
                  </div>
                  <div className="max-h-80 overflow-y-auto obsidian-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-zinc-600 text-[10px] uppercase tracking-widest font-bold">
                        Quiet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            if (n.post?._id) {
                              navigate(`/?post=${n.post._id}`);
                              setShowNotifications(false);
                            }
                          }}
                          className={`px-5 py-4 border-b border-white/5 transition-all cursor-pointer ${
                            n.read ? "bg-transparent hover:bg-white/5" : "bg-amber-500/5 hover:bg-amber-500/10"
                          }`}
                        >
                          <p className="text-[12px] text-zinc-300 m-0 leading-tight">
                            <strong className="text-white font-black uppercase text-[10px] mr-1">{n.sender?.name}</strong>{" "}
                            {n.type === "like" ? "liked" : "commented on"} your post.
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* --- FLOATING PILL NAV --- */}
      <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 sm:gap-2 p-2 glass-obsidian rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.special) {
            return (
              <Link
                key={item.id}
                to={item.path}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-black flex items-center justify-center mx-1 shadow-2xl hover:scale-110 transition-all duration-500 border-[3px] border-black"
              >
                {item.icon}
              </Link>
            );
          }

          if (item.highlighted) {
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-500 mx-0.5 sm:mx-1 ${
                  isActive ? "molten-glow scale-110" : "molten-glow opacity-80 hover:opacity-100 hover:scale-110"
                }`}
                title="Global Chat"
              >
                {item.icon}
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all duration-500 ${
                isActive 
                  ? "text-amber-500 bg-amber-500/10" 
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              {item.icon}
            </Link>
          );
        })}

        {/* Profile with Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all duration-500 border-0 ${
              location.pathname === "/profile" 
                ? "text-amber-500 bg-amber-500/10" 
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
            }`}
          >
            <FaUser size={18} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="absolute bottom-[calc(100%+24px)] right-0 w-48 sm:w-56 glass-obsidian border border-white/10 rounded-3xl shadow-3xl overflow-hidden z-50 p-2"
              >
                <div className="px-5 py-4 border-b border-white/5 mb-2">
                  <p className="text-[12px] font-black text-white m-0 uppercase tracking-tighter truncate">{user?.name}</p>
                </div>
                <div className="space-y-1">
                  {[
                    { label: "Profile", icon: <FaUser size={12} />, path: "/profile" },
                    { label: "Settings", icon: <FaCog size={12} />, path: "/settings" },
                  ].map((item) => (
                    <button 
                      key={item.path} 
                      onClick={() => { navigate(item.path); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-transparent border-0 text-zinc-400 text-[11px] font-bold uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all text-left"
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                  <div className="h-px bg-white/5 my-2 mx-4"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-transparent border-0 text-red-500 text-[11px] font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all text-left"
                  >
                    <FaSignOutAlt size={12} /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}