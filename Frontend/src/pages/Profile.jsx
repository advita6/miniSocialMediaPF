import { motion } from "framer-motion";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Unknown", email: "No email" };

  return (
    <div className="flex justify-center mt-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl"
      >
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-6">
            {user.name[0].toUpperCase()}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
          <p className="text-zinc-400 mb-8">{user.email}</p>
          
          <div className="w-full bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
            <h3 className="font-semibold text-zinc-200 border-b border-zinc-700 pb-2 mb-3">Account Setup</h3>
            <p className="text-sm text-zinc-400">Profile customization features coming soon!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
