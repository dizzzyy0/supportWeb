import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const userId = await AuthService.getCurrentUser();

          setUser({
            id: userId,
            role: decoded.role,
            email: decoded.email,
          });
        } catch (error) {
          console.error("Token decoding exeption:", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
    };

    fetchUser(); 
  }, []);

  const login = async (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    const userId = await AuthService.getCurrentUser();

    console.log("decodedLogin", decoded);
    console.log("userIdLogin", userId);

    setUser({ id: userId, role: decoded.role, email: decoded.email });
    if (decoded.role === "client") localStorage.setItem("id", userId);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    setUser(null);
  };

  const getUser = () => {
    console.log("USERS", user);
    return user;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
