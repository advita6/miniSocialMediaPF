import { Link, useLocation } from "react-router-dom";
import { FaHome, FaPlusSquare, FaComments, FaBell, FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: <FaHome />, label: "Home" },
    { path: "/create", icon: <FaPlusSquare />, label: "Create" },
    { path: "/chat", icon: <FaComments />, label: "Chat" },
  ];

  return (
    <div className="flex items-center justify-between px-6 py-3">
      
      {/* Logo */}
      <h1 className="text-xl font-bold tracking-wide cursor-pointer hover:text-blue-400 transition">
        SocialX
      </h1>

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
              <span className="hidden md:block text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5 text-lg">
        
        {/* Notifications */}
        <div className="relative cursor-pointer hover:scale-110 transition">
          <FaBell />
          <span className="absolute -top-1 -right-2 bg-red-500 text-xs px-1 rounded-full">
            3
          </span>
        </div>

        {/* Profile */}
        <div className="cursor-pointer hover:scale-110 transition">
          <FaUserCircle size={24} />
        </div>

      </div>

    </div>
  );
}