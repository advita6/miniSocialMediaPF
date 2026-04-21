import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa";
import AuthLayout from "../components/AuthLayout";
import API_BASE from "../api";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/");
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokenId: tokenResponse.access_token, isAccessToken: true }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("user", JSON.stringify(data));
          navigate("/");
        } else {
          setError(data.message || "Google Signup failed");
        }
      } catch (err) {
        setError("Google Auth Server error");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google Signup Failed"),
  });

  return (
    <AuthLayout>
      <form onSubmit={handleSignup}>
        <div className="chaotic-field">
          <label className="chaotic-label">Choose Alias (Name)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="chaotic-input"
            placeholder="CHAOS_WALKER"
            required
          />
        </div>

        <div className="chaotic-field">
          <label className="chaotic-label">Identity (Email)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="chaotic-input"
            placeholder="YOU@CHAOS.COM"
            required
          />
        </div>

        <div className="chaotic-field">
          <label className="chaotic-label">Encryption Key (Password)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="chaotic-input"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-red-500 text-xs font-black mb-4 uppercase">{error}</p>}

        <button type="submit" disabled={loading} className="chaotic-submit">
          {loading ? "Initializing..." : "Join the Void"}
        </button>

        <button 
          type="button" 
          onClick={() => googleLogin()}
          className="google-btn"
        >
          <FaGoogle size={14} />
          Sign up with Google
        </button>
      </form>
    </AuthLayout>
  );
}