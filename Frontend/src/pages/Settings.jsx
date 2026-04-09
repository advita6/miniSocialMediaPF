import { motion } from "framer-motion";
import { FaMoon, FaBell, FaShieldAlt } from "react-icons/fa";

export default function Settings() {
  return (
    <div className="flex justify-center mt-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl"
      >
        <h2 className="text-xl font-bold mb-6 border-b border-zinc-800 pb-4">Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 transition hover:border-zinc-600">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                <FaMoon size={18} />
              </div>
              <div>
                <p className="font-semibold text-zinc-200">Dark Mode</p>
                <p className="text-xs text-zinc-400">Toggle dark mode appearance</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-blue-500 rounded-full flex items-center p-1 justify-end cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 transition hover:border-zinc-600">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <FaBell size={18} />
              </div>
              <div>
                <p className="font-semibold text-zinc-200">Notifications</p>
                <p className="text-xs text-zinc-400">Manage alerts and emails</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-zinc-700 rounded-full flex items-center p-1 justify-start cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 transition hover:border-zinc-600">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <FaShieldAlt size={18} />
              </div>
              <div>
                <p className="font-semibold text-zinc-200">Security</p>
                <p className="text-xs text-zinc-400">Password and authentication</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
