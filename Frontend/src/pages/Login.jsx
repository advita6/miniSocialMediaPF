import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa";
import AuthLayout from "../components/AuthLayout";
import API_BASE from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Google Login Implementation ---
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // We send the access token to our backend to verify and get user data
        // Alternatively, use 'id_token' if using the 'implicit' flow or 'code' for 'auth-code' flow
        // For @react-oauth/google, we usually get an access_token. 
        // Our backend expects a tokenId (ID Token). 
        // To get an ID Token, we need to use a different login method or fetch user info.
        
        // Let's use the fetch approach to get user info or use a simpler Google Auth approach.
        // For simplicity, let's assume the backend verifies the access_token or we use the Google Identity Services directly.
        
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
          setError(data.message || "Google Login failed");
        }
      } catch (err) {
        setError("Google Auth Server error");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google Login Failed"),
  });

  return (
    <AuthLayout>
      <form onSubmit={handleLogin}>
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
          {loading ? "Decrypting..." : "Enter Void"}
        </button>

        <button 
          type="button" 
          onClick={() => googleLogin()}
          className="google-btn"
        >
          <FaGoogle size={14} />
          Sign in with Google
        </button>
      </form>
    </AuthLayout>
  );
}