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

// 🔥 Route Protectors
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

// 🔥 Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// 🎬 Page animation wrapper
const PageWrapper = ({ children }) => (
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
    if (localStorage.getItem("theme") === "light") {
      document.documentElement.classList.add("light-mode");
    }
  }, []);

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh", color: "white" }}>
      <ScrollToTop />

      {/* Navbar renders its own fixed top bar + fixed bottom pill */}
      {isAuthenticated && <Navbar />}

      {/* Page Content — padded top for fixed top bar, padded bottom for bottom pill */}
      <div className={isAuthenticated ? "pt-[72px] pb-28" : "py-6"}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<ProtectedRoute><PageWrapper><Home /></PageWrapper></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><PageWrapper><Explore /></PageWrapper></ProtectedRoute>} />
            <Route path="/login" element={<AuthRoute><PageWrapper><Login /></PageWrapper></AuthRoute>} />
            <Route path="/signup" element={<AuthRoute><PageWrapper><Signup /></PageWrapper></AuthRoute>} />
            <Route path="/create" element={<ProtectedRoute><PageWrapper><CreatePost /></PageWrapper></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><PageWrapper><Settings /></PageWrapper></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><PageWrapper><Admin /></PageWrapper></AdminRoute>} />
            <Route path="/chat" element={<ProtectedRoute><PageWrapper><Chat /></PageWrapper></ProtectedRoute>} />
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