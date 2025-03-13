import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import styles from "../styles/login.module.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email.includes("@")) {
      setError("Введіть коректний email");
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.login(formData);
      const user = await AuthService.getCurrentUser();
      
      const userRole = user?.role;
      const userId = user?._id;
      localStorage.setItem("role", userRole);

      if (userRole === "client" && userId) {
        localStorage.setItem("id", userId);
        navigate(`/info/${userId}`);
      } else if(userRole === "admin") {
        navigate("/usersPage");
      }else{
        navigate("/responsesPage");
      }
    } catch (error) {
      console.error(error);
      setError("Помилка входу. Перевірте дані.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const navigateTo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const id = localStorage.getItem("id");
          
          if (id) {
            navigate(`/info/${id}`);
          } else {
            navigate("/usersPage");
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    navigateTo();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.loginWrapper}>
        <div className={styles.card}>
          <div className={styles.logoContainer}>
            <div className={styles.logo}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
          </div>
          
          <h2 className={styles.title}>Вітаємо!</h2>
          <p className={styles.subtitle}>Увійдіть до вашого облікового запису</p>

          {error && (
            <div className={styles.error}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  type="email"
                  className={styles.input}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ваш email"
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Пароль</label>
              </div>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type="password"
                  className={styles.input}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Введіть пароль"
                  required
                />
              </div>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? (
                <span className={styles.loadingSpinner}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                  Вхід...
                </span>
              ) : (
                "Увійти"
              )}
            </button>
          </form>
          <p className={styles.registerText}>
            Ще не маєте облікового запису? <Link to="/register" className={styles.registerLink}>Зареєструватися</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;