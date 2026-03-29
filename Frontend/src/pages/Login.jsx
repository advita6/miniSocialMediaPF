import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Login successful 🚀");
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">

      <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-sm shadow-xl border border-zinc-800">

        <h2 className="text-2xl font-semibold text-center mb-6">
          Welcome Back 👋
        </h2>

        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            onClick={() => setShow(!show)}
            className="absolute right-3 top-3 cursor-pointer text-sm text-zinc-400"
          >
            {show ? "Hide" : "Show"}
          </span>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-500 transition flex justify-center"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Footer */}
        <p className="text-sm text-center mt-4 text-zinc-400">
          Don't have an account?{" "}
          <span className="text-blue-400 cursor-pointer">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}