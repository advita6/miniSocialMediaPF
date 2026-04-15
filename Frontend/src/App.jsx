import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import Explore from "./pages/Explore.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import Admin from "./pages/Admin.jsx";
import Chat from "./pages/Chat.jsx";
import { AnimatePresence, motion } from "framer-motion";

// Authentication guards
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AuthRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  if (user) return <Navigate to="/" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.isAdmin !== true) return <Navigate to="/" replace />;
  return children;
};

// Auto scroll to top on page change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Fade animations for pages
const AnimatedPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

function AppContent() {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("user");

  useEffect(() => {
    // Check for light mode preference
    if (localStorage.getItem("theme") === "light") {
      document.documentElement.classList.add("light-mode");
    }
  }, []);

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      <ScrollToTop />

      {/* Show Navbar only when logged in */}
      {isAuthenticated && <Navbar />}

      {/* Main page content area */}
      <div className={isAuthenticated ? "pt-[80px] pb-[100px]" : "py-6"}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<ProtectedRoute><AnimatedPage><Home /></AnimatedPage></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><AnimatedPage><Explore /></AnimatedPage></ProtectedRoute>} />
            <Route path="/login" element={<AuthRoute><AnimatedPage><Login /></AnimatedPage></AuthRoute>} />
            <Route path="/signup" element={<AuthRoute><AnimatedPage><Signup /></AnimatedPage></AuthRoute>} />
            <Route path="/create" element={<ProtectedRoute><AnimatedPage><CreatePost /></AnimatedPage></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AnimatedPage><Profile /></AnimatedPage></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AnimatedPage><Settings /></AnimatedPage></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AnimatedPage><Admin /></AnimatedPage></AdminRoute>} />
            <Route path="/chat" element={<ProtectedRoute><AnimatedPage><Chat /></AnimatedPage></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}