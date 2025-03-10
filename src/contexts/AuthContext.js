import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "../api/authService";

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
          //console.log("decoded", decoded);
          //console.log("userId", userId);
          setUser({
            id: userId,
            role: decoded.role,
            phoneNumber: decoded.id,
          });
        } catch (error) {
          console.error("Помилка декодування токена", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
    };

    fetchUser(); // Викликаємо асинхронну функцію
  }, []);

  const login = async (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    const userId = await AuthService.getCurrentUser();

    console.log("decodedLogin", decoded);
    console.log("userIdLogin", userId);

    setUser({ id: userId, role: decoded.role, phoneNumber: decoded.id });
    if (decoded.role === "user") localStorage.setItem("id", userId);

    //console.log("userLogin", user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    setUser(null);
  };

  const getUser = () => {
    console.log("USERssss", user);
    return user;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
