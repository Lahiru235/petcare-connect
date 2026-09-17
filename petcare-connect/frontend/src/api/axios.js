import axios from "axios";

// Single axios instance used by every service file (rule 1: axios everywhere)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pcc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// normalise errors and bounce expired sessions back to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "Cannot reach the server. Try again.";

    if (status === 401 && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem("pcc_token");
      localStorage.removeItem("pcc_user");
      window.location.href = "/login";
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
