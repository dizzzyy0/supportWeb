import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { AuthService } from "../../services/authService";

function Navigation() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const token = localStorage.getItem("token");
  const id = localStorage.getItem("id");
  const role = localStorage.getItem("role"); // Додаємо отримання ролі користувача

  const handleLogout = () => {
    AuthService.logout();
    logout();
    navigate("/login");
  };

  // Функція для відображення навігації в залежності від ролі
  const renderNavByRole = () => {
    if (!token) {
      // Неавторизований користувач
      return (
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/login">
              Увійти
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/register">
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
        <ul className="navbar-nav w-100 d-flex justify-content-between">
          <div className="d-flex">
            <li className="nav-item">
              <Link className="nav-link" to="/usersPage">
                Користувачі
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/responsesPage">
                Відповіді
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/requestsPage">
                Запити
              </Link>
            </li>
          </div>
          <div>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={handleLogout}
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
        <ul className="navbar-nav w-100 d-flex justify-content-between">
          <div className="d-flex">
            <li className="nav-item">
              <Link className="nav-link" to="/requestsPage">
                Запити
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/responsesPage">
                Відповіді
              </Link>
            </li>
          </div>
          <div>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i> Вийти
              </button>
            </li>
          </div>
        </ul>
      );
    } else {
      // Звичайний користувач - тільки кнопка "Вийти"
      return (
        <ul className="navbar-nav ms-auto">
           <div className="d-flex">
           <li className="nav-item">
              <Link className="nav-link" to="/usersPage">
                Користувачі
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/userDetail">
                Профіль
              </Link>
            </li>
          </div>
          <div>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={handleLogout}
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
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse justify-content-between"
          id="navbarNav"
        >
          {renderNavByRole()}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;