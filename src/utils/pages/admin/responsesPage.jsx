import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Form, Modal, Spinner, Alert } from "react-bootstrap";
import {
  getAllResponsesAction,
  getResponseByIdAction,
  createResponseAction,
  updateResponseAction,
  deleteResponseAction,
} from "../../../redux/actions/responseAction";
import { getAllUsersAction } from "../../../redux/actions/userAction";
import { getAllRequestsAction } from "../../../redux/actions/requestAction";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../../services/authService";

const ResponsesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { responses, error } = useSelector((state) => state.responses);
  const { users } = useSelector((state) => state.users);
  const { requests } = useSelector((state) => state.requests);
  
  // Замінюємо Redux селектор на локальний стан
  const [currentUser, setCurrentUser] = useState(null);
  
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentResponse, setCurrentResponse] = useState({
    requestId: "",
    userId: "",
    responseText: ""
  });
  const [detailResponse, setDetailResponse] = useState(null);
  
  const [errors, setErrors] = useState({
    responseText: "",
    submit: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState(null);

  // Додаємо ефект для отримання даних користувача
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error("Помилка отримання користувача:", err);
        setCurrentUser(null);
      }
    };

    fetchUser();
  }, []);

  // Check if user has permission to edit/delete a response
  const hasPermission = useCallback((responseUserId) => {
    if (!currentUser) return false;
    
    // Admin can edit/delete all responses
    if (currentUser.role === 'admin') return true;
    
    // Support can only edit/delete their own responses
    if (currentUser.role === 'support') {
      return currentUser._id === responseUserId;
    }
    
    return false;
  }, [currentUser]);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        dispatch(getAllResponsesAction()),
        dispatch(getAllUsersAction()),
        dispatch(getAllRequestsAction())
      ]);
      setLoading(false);
    };

    fetchData();
  }, [dispatch]);

  // Find user by ID
  const findUserById = useCallback((userId) => {
    if (!users) return null;
    return users.find(user => user._id === userId);
  }, [users]);

  // Find request by ID
  const findRequestById = useCallback((requestId) => {
    if (!requests) return null;
    return requests.find(request => request._id === requestId);
  }, [requests]);

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return "Невідомо";
    try {
      return new Date(dateString).toLocaleString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Помилка формату дати";
    }
  };

  // Filter responses when responses or search changes
  useEffect(() => {
    if (!responses) return;
    
    setFilteredResponses(
      responses.filter((response) => {
        const user = findUserById(response.userId);
        const request = findRequestById(response.requestId);
        const searchLower = search.trim().toLowerCase();
        
        return (
          (user && user.email && user.email.toLowerCase().includes(searchLower)) ||
          (request && request.requestNumber && String(request.requestNumber).includes(searchLower)) ||
          (response.responseText && response.responseText.toLowerCase().includes(searchLower))
        );
      })
    );
  }, [responses, search, findUserById, findRequestById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentResponse((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate response text
    if (name === "responseText") {
      setErrors((prev) => ({
        ...prev,
        responseText: value.trim() === "" ? "Відповідь не може бути порожньою" : ""
      }));
    }

    setErrors((prev) => ({
      ...prev,
      submit: ""
    }));
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (currentResponse.responseText.trim() === "") {
      setErrors((prev) => ({
        ...prev,
        responseText: "Відповідь не може бути порожньою"
      }));
      return;
    }

    if (!currentResponse.requestId) {
      setErrors((prev) => ({
        ...prev,
        submit: "Виберіть запит"
      }));
      return;
    }

    if (!currentResponse.userId) {
      setErrors((prev) => ({
        ...prev,
        submit: "Виберіть користувача"
      }));
      return;
    }

    // Check permission for editing
    if (editMode && !hasPermission(currentResponse.userId)) {
      setErrors((prev) => ({
        ...prev,
        submit: "У вас немає дозволу на редагування цієї відповіді"
      }));
      return;
    }

    setLoading(true);

    try {
      if (editMode && currentResponse._id) {
        await dispatch(updateResponseAction(currentResponse._id, currentResponse));
      } else {
        await dispatch(createResponseAction(currentResponse));
      }
      
      setShowModal(false);
      dispatch(getAllResponsesAction());
      resetForm();
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: "Помилка при обробці даних відповіді"
      }));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentResponse({
      requestId: "",
      userId: "",
      responseText: ""
    });
    setEditMode(false);
    setErrors({
      responseText: "",
      submit: ""
    });
  };

  const handleErrorClose = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const handleCloseModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleCloseDetailModal = () => {
    setDetailResponse(null);
    setShowDetailModal(false);
  };

  const handleEdit = (response) => {
    // Check permission
    if (!hasPermission(response.userId)) {
      setErrors((prev) => ({
        ...prev,
        submit: "У вас немає дозволу на редагування цієї відповіді"
      }));
      return;
    }
    
    setCurrentResponse({
      ...response
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (response) => {
    // Check permission
    if (!hasPermission(response.userId)) {
      setErrors((prev) => ({
        ...prev,
        submit: "У вас немає дозволу на видалення цієї відповіді"
      }));
      return;
    }
    
    setResponseToDelete(response._id);
    setConfirmDelete(true);
  };

  const confirmDeleteResponse = async () => {
    setLoading(true);
    try {
      await dispatch(deleteResponseAction(responseToDelete));
      dispatch(getAllResponsesAction());
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: "Помилка при видаленні відповіді"
      }));
    } finally {
      setLoading(false);
      setConfirmDelete(false);
      setResponseToDelete(null);
    }
  };

  const handleShowDetail = (response) => {
    setDetailResponse(response);
    setShowDetailModal(true);
  };

  const getRequestInfo = (request) => {
    if (!request) return null;
    
    return {
      requestNumber: request.requestNumber,
      status: request.status,
      problemDescription: request.problemDescription,
      createdAt: request.createdAt
    };
  };

  return (
    <div className="container mt-4">
      <h2>Відповіді на запити</h2>
      {error && (
        <Alert variant="danger" onClose={handleErrorClose} dismissible>
          {error}
        </Alert>
      )}
      
      {errors.submit && (
        <Alert variant="danger" onClose={() => setErrors(prev => ({...prev, submit: ""}))} dismissible>
          {errors.submit}
        </Alert>
      )}
      
      <div className="d-flex justify-content-between mb-3">
        <Form.Control
          type="text"
          placeholder="Пошук за запитом, користувачем або вмістом..."
          value={search}
          onChange={handleSearch}
          className="w-50"
          disabled={loading}
        />
        <Button onClick={() => { resetForm(); setShowModal(true); }} disabled={loading}>
          Додати
        </Button>
      </div>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Завантаження...</span>
          </Spinner>
        </div>
      ) : (
        <div className="row">
          {filteredResponses.length > 0 ? (
            filteredResponses.map((response) => {
              const user = findUserById(response.userId);
              const request = findRequestById(response.requestId);
              const canManage = hasPermission(response.userId);
              
              return (
                <div className="col-md-4 mb-3" key={response._id}>
                  <Card>
                    <Card.Body>
                      <Card.Title>
                        Відповідь на запит #{request ? request.requestNumber : 'Невідомий'}
                      </Card.Title>
                      <Card.Text>
                        <strong>Користувач:</strong> {user ? user.email : 'Невідомий'} <br />
                        <strong>Статус запиту:</strong> {request ? 
                          (request.status === 'open' ? 'Відкритий' : 
                           request.status === 'in_progress' ? 'В процесі' : 
                           request.status === 'closed' ? 'Закритий' : 'Невідомий') 
                          : 'Невідомий'} <br />
                        <strong>Текст відповіді:</strong> <br />
                        <div className="mt-1 mb-2 p-2 bg-light rounded">
                          {response.responseText && response.responseText.length > 100 
                            ? `${response.responseText.substring(0, 100)}...` 
                            : response.responseText}
                        </div>
                        <div className="mt-2 d-flex gap-2">
                          <Button 
                            variant="primary"
                            onClick={() => handleShowDetail(response)}
                          >
                            Детальніше
                          </Button>
                          {canManage && (
                            <>
                              <Button 
                                variant="warning"
                                onClick={() => handleEdit(response)}
                              >
                                Редагувати
                              </Button>
                              <Button 
                                variant="danger"
                                onClick={() => handleDelete(response)}
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
              );
            })
          ) : (
            <p className="text-center text-muted">
              Відповідей за таким запитом не знайдено
            </p>
          )}
        </div>
      )}

      {/* Модальне вікно для додавання/редагування відповіді */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Редагувати відповідь" : "Додати відповідь"}</Modal.Title>
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
            <Form.Group className="mb-3">
              <Form.Label>Запит</Form.Label>
              <Form.Select
                name="requestId"
                value={currentResponse.requestId}
                onChange={handleChange}
                required
              >
                <option value="">Виберіть запит</option>
                {requests && requests.map((request) => (
                  <option key={request._id} value={request._id}>
                    Запит #{request.requestNumber} - {request.status === 'open' ? 'Відкритий' : 
                                                     request.status === 'in_progress' ? 'В процесі' : 
                                                     request.status === 'closed' ? 'Закритий' : 'Невідомий'}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Користувач</Form.Label>
              <Form.Select
                name="userId"
                value={currentResponse.userId}
                onChange={handleChange}
                required
              >
                <option value="">Виберіть користувача</option>
                {users && users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.email}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Текст відповіді</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="responseText"
                value={currentResponse.responseText}
                onChange={handleChange}
                required
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

      {/* Модальне вікно для детального перегляду відповіді */}
      <Modal 
        show={showDetailModal} 
        onHide={handleCloseDetailModal}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Деталі відповіді</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailResponse && (
            <>
              <div className="mb-4">
                <h4>Інформація про запит</h4>
                {findRequestById(detailResponse.requestId) ? (
                  <div className="p-3 bg-light rounded">
                    <p><strong>Номер запиту:</strong> #{findRequestById(detailResponse.requestId).requestNumber}</p>
                    <p><strong>Статус запиту:</strong> {
                      findRequestById(detailResponse.requestId).status === 'open' ? 'Відкритий' :
                      findRequestById(detailResponse.requestId).status === 'in_progress' ? 'В процесі' :
                      findRequestById(detailResponse.requestId).status === 'closed' ? 'Закритий' : 'Невідомий'
                    }</p>
                    <p><strong>Опис проблеми:</strong> {findRequestById(detailResponse.requestId).problemDescription}</p>

                  </div>
                ) : (
                  <p className="text-muted">Інформація про запит недоступна</p>
                )}
              </div>
              
              <div className="mb-4">
                <h4>Відповідь</h4>
                <div className="p-3 bg-light rounded">
                  <p><strong>Автор відповіді:</strong> {findUserById(detailResponse.userId) ? findUserById(detailResponse.userId).email : 'Невідомий'}</p>
                  <p><strong>Остання редакція:</strong> {detailResponse.updatedAt ? formatDate(detailResponse.updatedAt) : 'Не редагувалось'}</p>
                  <hr />
                  <div className="mt-3">
                    <h5>Повний текст відповіді:</h5>
                    <div className="p-3 border rounded mt-2">
                      {detailResponse.responseText}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {detailResponse && hasPermission(detailResponse.userId) && (
            <>
              <Button 
                variant="warning" 
                onClick={() => {
                  handleEdit(detailResponse);
                  handleCloseDetailModal();
                }}
              >
                Редагувати
              </Button>
              <Button 
                variant="danger" 
                onClick={() => {
                  handleDelete(detailResponse);
                  handleCloseDetailModal();
                }}
              >
                Видалити
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={handleCloseDetailModal}>
            Закрити
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модальне вікно підтвердження видалення */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Підтвердження видалення</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Ви впевнені, що хочете видалити цю відповідь?</p>
          <p>Ця дія є незворотною.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Скасувати
          </Button>
          <Button variant="danger" onClick={confirmDeleteResponse} disabled={loading}>
            {loading ? "Видалення..." : "Видалити"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ResponsesPage;