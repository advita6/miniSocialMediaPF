import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTrash, FaBan, FaCheckCircle, FaUser } from "react-icons/fa";
import API_BASE from "../api";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch users
      const usersRes = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { "Authorization": `Bearer ${currentUser?.token || ""}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // Fetch posts (using public endpoint, can also be admin specific)
      const postsRes = await fetch(`${API_BASE}/api/posts`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestrict = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/restrict`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${currentUser?.token || ""}` }
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert("Failed to restrict user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user and all their posts?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${currentUser?.token || ""}` }
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${currentUser?.token || ""}` }
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser || !currentUser.isAdmin) {
    return <div className="text-center font-bold text-red-500 mt-10">Access Denied. Admins only.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-6 px-4">
      <h1 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">Admin Dashboard</h1>
      
      {loading ? (
        <p className="text-zinc-400 text-center">Loading Data...</p>
      ) : (
        <div className="space-y-12">
          
          {/* Users Table */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FaUser /> Manage Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                      <td className="p-3 text-white flex items-center gap-2">
                        {u.isAdmin && <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">ADMIN</span>}
                        {u.name}
                      </td>
                      <td className="p-3 text-zinc-400">{u.email}</td>
                      <td className="p-3">
                        {u.isRestricted ? (
                          <span className="text-red-400 text-sm font-semibold flex items-center gap-1"><FaBan /> Restricted</span>
                        ) : (
                          <span className="text-green-400 text-sm font-semibold flex items-center gap-1"><FaCheckCircle /> Active</span>
                        )}
                      </td>
                      <td className="p-3 flex items-center justify-end gap-3">
                        {u._id !== currentUser._id && (
                          <>
                            <button onClick={() => handleRestrict(u._id)} className="text-yellow-500 hover:text-yellow-400 transition" title="Toggle Restrict">
                              {u.isRestricted ? "Unrestrict" : "Restrict"}
                            </button>
                            <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-400 transition" title="Delete User">
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Posts Table */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Manage Posts</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="p-3">Author</th>
                    <th className="p-3">Content Snippet</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(p => (
                    <tr key={p._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                      <td className="p-3 text-white">{p.userId?.name || "Anonymous"}</td>
                      <td className="p-3 text-zinc-400 truncate max-w-xs">{p.content}</td>
                      <td className="p-3 flex items-center justify-end">
                         <button onClick={() => handleDeletePost(p._id)} className="text-red-500 hover:text-red-400 transition" title="Delete Post">
                           <FaTrash />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
          
        </div>
      )}
    </div>
  );
}
