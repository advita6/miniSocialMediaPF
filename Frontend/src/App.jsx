import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import CreatePost from "./pages/CreatePost.jsx";
// ❌ Removed ChatRoom import
import { AnimatePresence, motion } from "framer-motion";

// 🔥 Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// 🎬 Page animation wrapper
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

function AppContent() {
  const location = useLocation();

  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      
      <ScrollToTop />

      {/* 🔥 Navbar */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-900/70 border-b border-zinc-800">
        <Navbar />
      </div>

      {/* Page Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            
            <Route
              path="/"
              element={
                <PageWrapper>
                  <Home />
                </PageWrapper>
              }
            />

            <Route
              path="/login"
              element={
                <PageWrapper>
                  <Login />
                </PageWrapper>
              }
            />

            <Route
              path="/signup"
              element={
                <PageWrapper>
                  <Signup />
                </PageWrapper>
              }
            />

            <Route
              path="/create"
              element={
                <PageWrapper>
                  <CreatePost />
                </PageWrapper>
              }
            />

            {/* ❌ Chat route removed */}

          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

// 🔥 Main Export
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}