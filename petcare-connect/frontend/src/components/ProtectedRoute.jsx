import { Navigate, useLocation } from "react-router-dom";
import { useAuth, homeFor } from "../context/AuthContext";
import { Loader } from "./UI";

// Blocks a route unless the session role is allowed (FR-02)
const ProtectedRoute = ({ allow = [], children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Checking your session…" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allow.length && !allow.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;

  return children;
};

export default ProtectedRoute;
