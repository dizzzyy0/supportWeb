import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { AuthService } from "../../services/authService";

function Navigation() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const id = localStorage.getItem("id");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    AuthService.logout();
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Функція для відображення навігації в залежності від ролі
  const renderNavByRole = () => {
    if (!token) {
      // Неавторизований користувач
      return (
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/login" onClick={() => setIsMenuOpen(false)}>
              Увійти
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/register" onClick={() => setIsMenuOpen(false)}>
              Зареєструватись
            </Link>
          </li>
        </ul>
      );
    }

    // Авторизований користувач
    if (role === "admin") {
      // Навігація для адміністратора
      return (
        <ul className="navbar-nav w-100 d-flex flex-column flex-lg-row justify-content-between">
          <div className="d-flex flex-column flex-lg-row">
            <li className="nav-item">
              <Link className="nav-link" to="/usersPage" onClick={() => setIsMenuOpen(false)}>
                Користувачі
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/responsesPage" onClick={() => setIsMenuOpen(false)}>
                Відповіді
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/requestsPage" onClick={() => setIsMenuOpen(false)}>
                Запити
              </Link>
            </li>
          </div>
          <div>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <i className="bi bi-box-arrow-right"></i> Вийти
              </button>
            </li>
          </div>
        </ul>
      );
    } else if (role === "support") {
      // Навігація для support
      return (
        <ul className="navbar-nav w-100 d-flex flex-column flex-lg-row justify-content-between">
          <div className="d-flex flex-column flex-lg-row">
            <li className="nav-item">
              <Link className="nav-link" to="/requestsPage" onClick={() => setIsMenuOpen(false)}>
                Запити
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/responsesPage" onClick={() => setIsMenuOpen(false)}>
                Відповіді
              </Link>
            </li>
          </div>
          <div>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <i className="bi bi-box-arrow-right"></i> Вийти
              </button>
            </li>
          </div>
        </ul>
      );
    } else {
      // Звичайний користувач
      return (
        <ul className="navbar-nav w-100 d-flex flex-column flex-lg-row justify-content-between">
          <div className="d-flex flex-column flex-lg-row">
            <li className="nav-item">
              <Link className="nav-link" to="/usersPage" onClick={() => setIsMenuOpen(false)}>
                Користувачі
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/userDetail" onClick={() => setIsMenuOpen(false)}>
                Профіль
              </Link>
            </li>
          </div>
          <div>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <i className="bi bi-box-arrow-right"></i> Вийти
              </button>
            </li>
          </div>
        </ul>
      );
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container d-flex justify-content-between align-items-center">
        <Link className="navbar-brand fw-bold" to="/">
          Support
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse justify-content-between ${isMenuOpen ? 'show' : ''}`}
          id="navbarNav"
        >
          {renderNavByRole()}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;