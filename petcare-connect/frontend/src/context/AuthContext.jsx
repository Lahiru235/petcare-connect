import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("pcc_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pcc_token");
    if (!token) return setLoading(false);
    authApi
      .me()
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("pcc_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("pcc_token");
        localStorage.removeItem("pcc_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSession = ({ user: u, token }) => {
    localStorage.setItem("pcc_token", token);
    localStorage.setItem("pcc_user", JSON.stringify(u));
    setUser(u);
    return u;
  };

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    return saveSession(data);
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    return saveSession(data);
  };

  const updateProfile = async (payload) => {
    const { data } = await authApi.updateMe(payload);
    localStorage.setItem("pcc_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("pcc_token");
    localStorage.removeItem("pcc_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// where each role lands after login
export const homeFor = (role) =>
  ({ owner: "/owner", doctor: "/doctor", receptionist: "/reception", admin: "/admin" }[role] || "/login");
