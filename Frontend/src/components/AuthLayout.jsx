import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export default function AuthLayout({ children }) {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div className="layout-wrapper">
      {/* Liquid Metallic Moving Background */}
      <div className="liquid-bg-wrapper">
        <div className="liquid-bg-image" />
        <div className="liquid-overlay" />
        <div className="noise-filter" />
      </div>

      <div className="main-content">
        {/* Left Section: Branding */}
        <div className="flex-1 text-left relative z-10 pr-10">
          {/* New Sleek Logo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 10L30 30" stroke="white" strokeWidth="6" strokeLinecap="round" className="amber-glow-path" />
              <path d="M30 10L10 30" stroke="#FF8C00" strokeWidth="6" strokeLinecap="round" />
              <circle cx="20" cy="20" r="4" fill="white" className="animate-pulse" />
            </svg>
          </motion.div>

          <motion.h1 
            className="loud-tagline font-chaotic"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            Let the <br />
            shenanigans <span className="amber-text">commence.</span>
          </motion.h1>

          <motion.p 
            className="chaotic-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Your daily dose of Reddit brain-rot and institutional gossip. 
            Anonymous. Aggressive. <span className="text-white font-bold">Absolutely Unfiltered.</span>
          </motion.p>

          <div className="loud-features">
            <motion.div 
              className="loud-feature-card"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <h4 className="loud-feature-title">THE VOID</h4>
              <p className="loud-feature-desc">Real-time anonymous chatroom.</p>
            </motion.div>

            <motion.div 
              className="loud-feature-card"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <h4 className="loud-feature-title">MEME SCAN</h4>
              <p className="loud-feature-desc">Reddit's elite brain-rot dump.</p>
            </motion.div>

            <motion.div 
              className="loud-feature-card"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.8 }}
            >
              <h4 className="loud-feature-title">GOSSIP</h4>
              <p className="loud-feature-desc">Institutional messy archives.</p>
            </motion.div>
          </div>
        </div>

        {/* Right Section: Auth Card */}
        <motion.div 
          className="chaotic-card flex-none"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="chaotic-tabs">
            <Link 
              to="/login" 
              className={`chaotic-tab ${isLogin ? "chaotic-tab-active" : ""}`}
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className={`chaotic-tab ${!isLogin ? "chaotic-tab-active" : ""}`}
            >
              Join chaos
            </Link>
          </div>

          <div className="auth-form-content">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
