import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Form, Modal, Spinner, Alert } from "react-bootstrap";
import {
  getAllUsersAction,
  getUserByIdAction,
  updateUserAction,
  deleteUserAction,
} from "../../../redux/actions/userAction";

import { useNavigate } from "react-router-dom";
import { AuthService } from "../../../services/authService";

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, error } = useSelector((state) => state.users);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    username: "",
    surename: "",
    email: "",
    role: "client",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    submit: "",
  });
  const [newUser, setNewUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await dispatch(getAllUsersAction());
      setLoading(false);
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
      const fetchUser = async () => {
        try {
          const user = await AuthService.getCurrentUser();
          setNewUser(user);
        } catch (err) {
          console.error("Помилка отримання користувача:", err);
          setNewUser(null);
        }
      };
  
      fetchUser();
    }, []);

  const isAdmin = newUser && newUser.role === "admin";

  // Фільтрація користувачів при зміні users або search
  useEffect(() => {
    if (!users) return;
    
    setFilteredUsers(
      users.filter((user) =>
        user.email
          ? user.email.toLowerCase().includes(search.trim().toLowerCase())
          : false
      )
    );
  }, [users, search]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Валідація email
    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email:
          value && !validateEmail(value) ? "Введіть коректну email адресу" : "",
      }));
    }

    setErrors((prev) => ({
      ...prev,
      submit: "",
    }));
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(currentUser.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Введіть коректну email адресу",
      }));
      return;
    }

    // Якщо є будь-які помилки, не відправляємо форму
    if (errors.email) {
      return;
    }

    setLoading(true);

    try {
      if (editMode && currentUser._id) {
        await dispatch(updateUserAction(currentUser._id, currentUser));
      }
      
      setShowModal(false);
      dispatch(getAllUsersAction());
      resetForm();
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: "Помилка при обробці даних користувача",
      }));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentUser({
      username: "",
      surename: "",
      email: "",
      role: "client",
      password: "",
    });
    setEditMode(false);
    setErrors({
      email: "",
      submit: "",
    });
  };

  const handleErrorClose = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const handleCloseModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleEdit = (user) => {
    setCurrentUser({
      ...user,
      password: "" 
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (userId) => {
    setUserToDelete(userId);
    setConfirmDelete(true);
  };

  const confirmDeleteUser = async () => {
    setLoading(true);
    try {
      await dispatch(deleteUserAction(userToDelete));
      dispatch(getAllUsersAction());
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: "Помилка при видаленні користувача",
      }));
    } finally {
      setLoading(false);
      setConfirmDelete(false);
      setUserToDelete(null);
    }
  };

  const handleNavigate = (id) => {
    navigate(`/userDetail/${id}`);
  };

  return (
    <div className="container mt-4">
      <h2>Користувачі</h2>
      {error && (
        <Alert variant="danger" onClose={handleErrorClose} dismissible>
          {error}
        </Alert>
      )}
      <div className="d-flex justify-content-between mb-3">
        <Form.Control
          type="text"
          placeholder="Пошук за email..."
          value={search}
          onChange={handleSearch}
          className="w-50"
          disabled={loading}
        />
      </div>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Завантаження...</span>
          </Spinner>
        </div>
      ) : (
        <div className="row">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div className="col-md-4 mb-3" key={user._id}>
                <Card>
                  <Card.Body>
                    <Card.Title>
                      {user.username} {user.surename}
                    </Card.Title>
                    <Card.Text>
                      <strong>Email:</strong> {user.email} <br />
                      <strong>Роль:</strong> {user.role} <br />
                      <div className="mt-2 d-flex gap-2">
                        <Button 
                          variant="primary"
                          onClick={() => handleNavigate(user._id)}
                        >
                          Детальніше
                        </Button>
                        {isAdmin && (
                          <>
                            <Button 
                              variant="warning"
                              onClick={() => handleEdit(user)}
                            >
                              Редагувати
                            </Button>
                            <Button 
                              variant="danger"
                              onClick={() => handleDelete(user._id)}
                            >
                              Видалити
                            </Button>
                          </>
                        )}
                      </div>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">
              Користувачів за таким запитом не знайдено
            </p>
          )}
        </div>
      )}

      {/* Модальне вікно для додавання/редагування користувача */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Редагувати користувача" : "Додати користувача"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errors && Object.values(errors).some((error) => error) && (
            <div className="alert alert-danger">
              <ul>
                {Object.values(errors)
                  .filter((error) => error)
                  .map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
              </ul>
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Ім'я</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={currentUser.username}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Прізвище</Form.Label>
              <Form.Control
                type="text"
                name="surename"
                value={currentUser.surename}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={currentUser.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Роль</Form.Label>
              <Form.Select
                name="role"
                value={currentUser.role}
                onChange={handleChange}
                required
              >
                <option value="client">Клієнт</option>
                <option value="support">Підтримка</option>
                <option value="admin">Адміністратор</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Пароль {editMode && "(залиште порожнім, щоб не змінювати)"}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={currentUser.password}
                onChange={handleChange}
                required={!editMode}
                minLength="6"
              />
            </Form.Group>
            <Button
              type="submit"
              className="btn btn-primary w-100 mt-3"
              disabled={loading}
            >
              {loading ? "Обробка..." : editMode ? "Зберегти зміни" : "Створити"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Модальне вікно підтвердження видалення */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Підтвердження видалення</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Ви впевнені, що хочете видалити цього користувача?</p>
          <p>Ця дія є незворотною.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Скасувати
          </Button>
          <Button variant="danger" onClick={confirmDeleteUser} disabled={loading}>
            {loading ? "Видалення..." : "Видалити"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsersPage;