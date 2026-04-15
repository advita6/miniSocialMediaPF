import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome, FaCompass, FaPlus, FaComments, FaUser,
  FaBell, FaSignOutAlt, FaCog, FaShieldAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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
        const res = await fetch("/api/notifications", {
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
        await fetch("/api/notifications/read", {
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
      <div
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: "rgba(13,13,13,0.45)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          height: 64,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{
            width: 10, height: 10, borderRadius: "50%",
            background: "#FF354C", flexShrink: 0, display: "inline-block",
          }} />
          <span style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "-0.5px" }}>
            SocialX
          </span>
        </Link>

        {/* Right — Bell only */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* Notifications */}
          <div style={{ position: "relative" }} ref={notificationsRef}>
            <button
              onClick={handleNotificationsClick}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.07)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: showNotifications ? "white" : "#888",
                cursor: "pointer", transition: "color 0.2s", position: "relative",
              }}
            >
              <FaBell size={13} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: -1, right: -1,
                  background: "#FF354C", color: "white",
                  fontSize: 9, fontWeight: 700,
                  width: 16, height: 16, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid #0D0D0D",
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute", top: "calc(100% + 12px)", right: 0,
                    width: 320, background: "#1A1A1A",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 18, boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                    overflow: "hidden", zIndex: 999,
                  }}
                >
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 700, fontSize: 14 }}>
                    Notifications
                  </div>
                  <div style={{ maxHeight: 380, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 24, textAlign: "center", color: "#555", fontSize: 13 }}>
                        No notifications yet
                      </div>
                    ) : notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          if (n.post?._id) {
                            navigate(`/?post=${n.post._id}`);
                            setShowNotifications(false);
                          }
                        }}
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                          cursor: n.post?._id ? "pointer" : "default",
                          background: n.read ? "transparent" : "rgba(255,255,255,0.04)",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? "transparent" : "rgba(255,255,255,0.04)")}
                      >
                        <p style={{ fontSize: 13, color: "#D1D5DB", margin: 0 }}>
                          <strong style={{ color: "white" }}>{n.sender?.name}</strong>{" "}
                          {n.type === "like" ? "liked" : "commented on"} your post.
                        </p>
                        {n.post?._id && (
                          <p style={{ fontSize: 11, color: "#00D97E", margin: "3px 0 0" }}>
                            Click to view post →
                          </p>
                        )}
                        <p style={{ fontSize: 11, color: "#555", margin: "3px 0 0" }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ════ BOTTOM PILL NAV ════ */}
      <div style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        zIndex: 50, display: "flex", alignItems: "center", gap: 4,
        padding: "8px 16px",
        background: "rgba(20,20,20,0.45)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 999,
        boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
      }}>
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          if (item.special) {
            return (
              <Link
                key={item.id}
                to={item.path}
                style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "#00D97E",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#000", textDecoration: "none",
                  margin: "0 4px",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                {item.icon}
              </Link>
            );
          }
          return (
            <Link
              key={item.id}
              to={item.path}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isActive ? "white" : "#666",
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                textDecoration: "none",
                transition: "color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#aaa"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#666"; }}
            >
              {item.icon}
            </Link>
          );
        })}

        {/* Profile icon with dropdown */}
        <div style={{ position: "relative" }} ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            style={{
              width: 44, height: 44, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: location.pathname === "/profile" ? "white" : "#666",
              background: location.pathname === "/profile" ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none", cursor: "pointer",
              transition: "color 0.2s, background 0.2s",
            }}
          >
            <FaUser size={18} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute", bottom: "calc(100% + 12px)", right: 0,
                  width: 200, background: "#1A1A1A",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 18, boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                  overflow: "hidden", zIndex: 999,
                }}
              >
                <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
                  <p style={{ fontSize: 11, color: "#555", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
                </div>
                <div style={{ padding: 8 }}>
                  {[
                    { label: "Profile", icon: <FaUser size={12} />, path: "/profile" },
                    { label: "Settings", icon: <FaCog size={12} />, path: "/settings" },
                  ].map((item) => (
                    <button key={item.path} onClick={() => { navigate(item.path); setShowProfileMenu(false); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", borderRadius: 12,
                        background: "none", border: "none", cursor: "pointer",
                        color: "#999", fontSize: 13, transition: "background 0.2s, color 0.2s",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "white"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#999"; }}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                  {user?.isAdmin && (
                    <button onClick={() => { navigate("/admin"); setShowProfileMenu(false); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", borderRadius: 12,
                        background: "none", border: "none", cursor: "pointer",
                        color: "#60a5fa", fontSize: 13, transition: "background 0.2s",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(96,165,250,0.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <FaShieldAlt size={12} /> Admin Panel
                    </button>
                  )}
                  <button onClick={handleLogout}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 12, marginTop: 4,
                      background: "none", border: "none", cursor: "pointer",
                      color: "#f87171", fontSize: 13, transition: "background 0.2s",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,113,113,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
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