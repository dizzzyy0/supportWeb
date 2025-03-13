import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthService } from "../../services/authService";
import styles from "../styles/register.module.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    surename: "",
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
      await AuthService.register(formData);
      navigate("/login");
    } catch (error) {
      console.error(error);
      setError("Помилка реєстрації. Перевірте дані.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.registerWrapper}>
        <div className={styles.card}>
          <div className={styles.logoContainer}>
            <div className={styles.logo}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
          </div>
          
          <h2 className={styles.title}>Створіть обліковий запис</h2>
          <p className={styles.subtitle}>Заповніть форму для реєстрації</p>

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
              <label className={styles.label}>Ім'я</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  type="text"
                  className={styles.input}
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Введіть ваше ім'я"
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Прізвище</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  type="text"
                  className={styles.input}
                  name="surename"
                  value={formData.surename}
                  onChange={handleChange}
                  placeholder="Введіть ваше прізвище"
                  required
                />
              </div>
            </div>

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
                  placeholder="Введіть ваш email"
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Пароль</label>
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
                  placeholder="Створіть надійний пароль"
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
                  Реєстрація...
                </span>
              ) : (
                "Зареєструватися"
              )}
            </button>
          </form>
          <p className={styles.loginText}>
            Вже маєте обліковий запис? <Link to="/login" className={styles.loginLink}>Увійти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;