import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children, role }) => {
  const id = localStorage.getItem("id") || null;
  const token = localStorage.getItem("token") || null;

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (id) {
    return <Navigate to={`/info/${id}`} />;
  }

  return children;
};

export default PrivateRoute;
