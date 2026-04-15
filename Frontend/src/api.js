// Centralized API configuration
// In development, Vite proxy handles '/api' → 'localhost:5000'
// In production, this points to the deployed Railway backend URL
const API_BASE = import.meta.env.VITE_API_URL || "";

export default API_BASE;
