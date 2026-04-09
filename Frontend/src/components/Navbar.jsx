import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaPlusSquare, FaComments, FaBell, FaUserCircle, FaSignOutAlt, FaUser, FaCog } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const navItems = [
    { path: "/", icon: <FaHome />, label: "Home" },
    { path: "/create", icon: <FaPlusSquare />, label: "Create" },
    { path: "/chat", icon: <FaComments />, label: "Chat" },
  ];

  const notifications = [
    { id: 1, text: "Welcome to SocialX! 🚀", time: "just now" },
    { id: 2, text: "Someone liked your recent post ❤️", time: "10m ago" },
    { id: 3, text: "You have a new follower!", time: "1h ago" },
  ];

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 relative">
      
      {/* Logo */}
      <Link to="/" className="text-xl font-bold tracking-wide cursor-pointer hover:text-blue-400 transition bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
        SocialX
      </Link>

      {/* Center Nav */}
      <div className="flex gap-8 text-lg">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={i}
              to={item.path}
              className={`flex items-center gap-2 transition ${
                isActive
                  ? "text-blue-500 scale-110"
                  : "text-zinc-400 hover:text-white hover:scale-105"
              }`}
            >
              {item.icon}
              <span className="hidden md:block text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5 text-lg">
        
        {/* Notifications */}
        <div className="relative group" ref={notificationsRef}>
          <div 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`cursor-pointer transition p-2 rounded-full ${showNotifications ? "bg-zinc-800 text-blue-400" : "hover:bg-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            <FaBell />
            <span className="absolute top-1 right-1 bg-red-500 text-[10px] w-4 h-4 flex items-center justify-center font-bold rounded-full border-2 border-zinc-900">
              3
            </span>
          </div>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl bg-opacity-90"
              >
                <div className="p-4 border-b border-zinc-800 font-bold text-sm">Notifications</div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 hover:bg-zinc-800 transition cursor-pointer border-b border-zinc-800/50 last:border-0 text-sm">
                      <p className="text-zinc-200">{n.text}</p>
                      <span className="text-xs text-zinc-500">{n.time}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={userMenuRef}>
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`cursor-pointer transition flex items-center gap-2 p-1 pl-3 rounded-full border border-transparent ${showUserMenu ? "bg-zinc-800 border-zinc-700" : "hover:bg-zinc-800"}`}
          >
            <span className="text-xs font-semibold text-zinc-300 hidden sm:block">{user?.name}</span>
            <FaUserCircle size={28} className={showUserMenu ? "text-blue-400" : "text-zinc-400"} />
          </div>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl bg-opacity-90"
              >
                {/* User Info */}
                <div className="p-4 bg-zinc-800/30 border-b border-zinc-800">
                  <p className="text-sm font-bold truncate text-white">{user?.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                </div>

                {/* Options */}
                <div className="p-2">
                  <div 
                    onClick={() => { navigate("/profile"); setShowUserMenu(false); }}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                  >
                    <FaUser size={14} /> Profile
                  </div>
                  <div 
                    onClick={() => { navigate("/settings"); setShowUserMenu(false); }}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                  >
                    <FaCog size={14} /> Settings
                  </div>
                  <div 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer mt-1"
                  >
                    <FaSignOutAlt size={14} /> Logout
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}