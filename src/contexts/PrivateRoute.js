import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children, role }) => {
  const id = localStorage.getItem("id") || null;
  const token = localStorage.getItem("token") || null;
  const currentRole = localStorage.getItem("role") || null;

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
