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

  // ── Fetch notifications ──
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

  // ── Close on outside click ──
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

  // ── Bottom nav items ──
  const bottomItems = [
    { path: "/", icon: <FaHome size={20} />, id: "home" },
    { path: "/explore", icon: <FaCompass size={20} />, id: "explore" },
    { path: "/create", icon: <FaPlus size={22} />, id: "create", special: true },
    { path: "/chat", icon: <FaComments size={20} />, id: "chat" },
  ];

  return (
    <>
      {/* ════ TOP BAR ════ */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-zinc-950/40 backdrop-blur-xl backdrop-saturate-150 border-b border-white/5">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-decoration-none group">
          <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] group-hover:scale-110 transition-transform"></div>
          <span className="text-xl font-extrabold text-white tracking-tight">
            SocialX
          </span>
        </Link>

        {/* Right — Bell */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={handleNotificationsClick}
              className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 transition-all ${
                showNotifications ? "bg-zinc-800 text-white" : "bg-black/20 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <FaBell size={14} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex flex-col items-center justify-center border-2 border-zinc-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-[calc(100%+12px)] right-0 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[999]"
                >
                  <div className="px-4 py-3 border-b border-white/5 font-bold text-sm text-zinc-100">
                    Notifications
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-zinc-500 text-sm">
                        No notifications yet
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
                          className={`p-3.5 border-b border-white/5 transition-colors cursor-pointer ${
                            n.read ? "bg-transparent hover:bg-white/5" : "bg-indigo-500/10 hover:bg-indigo-500/20"
                          }`}
                        >
                          <p className="text-[13px] text-zinc-300 m-0 leading-snug">
                            <strong className="text-white font-semibold">{n.sender?.name}</strong>{" "}
                            {n.type === "like" ? "liked" : "commented on"} your post.
                          </p>
                          {n.post?._id && (
                            <p className="text-[11px] text-indigo-400 m-0 mt-1.5 font-medium">
                              Click to view post &rarr;
                            </p>
                          )}
                          <p className="text-[11px] text-zinc-500 m-0 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
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

      {/* ════ BOTTOM PILL NAV ════ */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-2 bg-zinc-950/60 backdrop-blur-2xl backdrop-saturate-200 border border-white/10 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          if (item.special) {
            return (
              <Link
                key={item.id}
                to={item.path}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white mx-1 shadow-lg hover:scale-110 hover:shadow-indigo-500/50 transition-all duration-300"
              >
                {item.icon}
              </Link>
            );
          }
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive 
                  ? "text-white bg-white/10 shadow-inner" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              {item.icon}
            </Link>
          );
        })}

        {/* Profile icon with dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border-0 ${
              location.pathname === "/profile" 
                ? "text-white bg-white/10 shadow-inner" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
            }`}
          >
            <FaUser size={18} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute bottom-[calc(100%+16px)] right-0 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[999]"
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-[13px] font-bold text-white m-0 truncate">{user?.name}</p>
                  <p className="text-[11px] text-zinc-400 m-0 mt-0.5 truncate">{user?.email}</p>
                </div>
                <div className="p-2 space-y-1">
                  {[
                    { label: "Profile", icon: <FaUser size={12} />, path: "/profile" },
                    { label: "Settings", icon: <FaCog size={12} />, path: "/settings" },
                  ].map((item) => (
                    <button 
                      key={item.path} 
                      onClick={() => { navigate(item.path); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-transparent border-0 text-zinc-400 text-[13px] font-medium hover:bg-white/5 hover:text-white transition-colors text-left"
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                  
                  {user?.isAdmin && (
                    <button 
                      onClick={() => { navigate("/admin"); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-transparent border-0 text-blue-400 text-[13px] font-medium hover:bg-blue-500/10 transition-colors text-left"
                    >
                      <FaShieldAlt size={12} /> Admin Panel
                    </button>
                  )}
                  
                  <div className="h-px bg-white/5 my-1 mx-2"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-transparent border-0 text-red-400 text-[13px] font-medium hover:bg-red-500/10 transition-colors text-left"
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