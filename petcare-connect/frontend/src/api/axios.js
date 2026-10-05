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

    if (status === 401 && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem("pcc_token");
      localStorage.removeItem("pcc_user");
      window.location.href = "/login";
    }

    // The API answered: always surface what the server actually said.
    // Keep `response` attached so callers can branch on the status code.
    if (error.response) {
      const data = error.response.data;
      const message =
        (typeof data === "string" && data) ||
        data?.message ||
        `Request failed with status ${status}.`;
      const normalised = new Error(message);
      normalised.response = error.response;
      normalised.status = status;
      return Promise.reject(normalised);
    }

    // No response at all, so the request never reached the API. Say which
    // URL failed instead of a generic message that hides the real cause.
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return Promise.reject(
        new Error(`The server at ${api.defaults.baseURL} took too long to respond.`)
      );
    }
    return Promise.reject(
      new Error(
        `Cannot reach the API at ${api.defaults.baseURL}. Make sure the backend is running on port 5000.`
      )
    );
  }
);

export default api;
