import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Form, Modal, Spinner, Alert, Badge } from "react-bootstrap";
import {
  getAllRequestsAction,
  getRequestByIdAction,
  createRequestAction,
  updateRequestAction,
  updateRequestStatusAction,
  deleteRequestAction,
  findRequestsAction,
  addResponseToRequestAction
} from "../../../redux/actions/requestAction";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../../services/authService";

const RequestsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requests, error } = useSelector((state) => state.requests);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRequest, setCurrentRequest] = useState({
    problemDescription: "",
    status: "open"
  });
  const [replyData, setReplyData] = useState({
    requestId: "",
    userId: "",
    requestNumber: "",
    userEmail: "",
    response: ""
  });
  const [errors, setErrors] = useState({
    problemDescription: "",
    response: "",
    submit: ""
  });
  const [loading, setLoading] = useState(true);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Помилка отримання користувача:", err);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      
      console.log(`user:${user.role}`);
      if (user?.role === 'admin' || user?.role === 'support') {
        await dispatch(getAllRequestsAction());
      } else if (user?._id) {
        await dispatch(findRequestsAction(null, user._id));
      }
      setLoading(false);
    };

    fetchData();
  }, [dispatch, user]);

  // Filter requests when requests or search or statusFilter changes
  useEffect(() => {
    if (!requests) return;
    
    let filtered = [...requests];
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    // Filter by search term (in request number or description)
    if (search.trim()) {
      const searchLower = search.trim().toLowerCase();
      filtered = filtered.filter(request => 
        (request.requestNumber && request.requestNumber.toString().includes(searchLower)) || 
        (request.problemDescription && request.problemDescription.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredRequests(filtered);
  }, [requests, search, statusFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentRequest(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "problemDescription" && !value.trim()) {
      setErrors(prev => ({
        ...prev,
        problemDescription: "Опис проблеми є обов'язковим"
      }));
    } else if (name === "problemDescription") {
      setErrors(prev => ({
        ...prev,
        problemDescription: ""
      }));
    }

    setErrors(prev => ({
      ...prev,
      submit: ""
    }));
  };

  const handleReplyChange = (e) => {
    const { name, value } = e.target;
    setReplyData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "response" && !value.trim()) {
      setErrors(prev => ({
        ...prev,
        response: "Відповідь є обов'язковою"
      }));
    } else if (name === "response") {
      setErrors(prev => ({
        ...prev,
        response: ""
      }));
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!currentRequest.problemDescription.trim()) {
      setErrors(prev => ({
        ...prev,
        problemDescription: "Опис проблеми є обов'язковим"
      }));
      return;
    }

    // Check for any validation errors
    if (errors.problemDescription) {
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        ...currentRequest,
        userId: user._id
      };

      if (editMode && currentRequest._id) {
        await dispatch(updateRequestAction(currentRequest._id, requestData));
      } else {
        await dispatch(createRequestAction(requestData));
      }
      
      setShowModal(false);
      
      // Refresh requests list
      if (user?.role === 'admin' || user?.role === 'support') {
        await dispatch(getAllRequestsAction());
      } else if (user?._id) {
        await dispatch(findRequestsAction(null, user._id));
      }
      
      resetForm();
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: "Помилка при обробці запиту"
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!replyData.response.trim()) {
      setErrors(prev => ({
        ...prev,
        response: "Відповідь є обов'язковою"
      }));
      return;
    }

    setLoading(true);

    try {
      // Створюємо об'єкт responseData відповідно до вказаної структури
      const responseData = {
        requestId: replyData.requestId,
        userId: user._id,  // ID поточного користувача, який відповідає
        responseText: replyData.response
      };

      // Використовуємо функцію для додавання відповіді
      await dispatch(addResponseToRequestAction(replyData.requestId, responseData));
      
      // Також оновлюємо статус запиту, якщо необхідно
      if (currentRequest.status === 'open') {
        await dispatch(updateRequestStatusAction(replyData.requestId, { 
          status: 'in_progress'
        }));
      }
      
      setShowReplyModal(false);
      
      // Оновлюємо список запитів
      if (user?.role === 'admin' || user?.role === 'support') {
        await dispatch(getAllRequestsAction());
      } else if (user?._id) {
        await dispatch(findRequestsAction(null, user._id));
      }
      
      // Скидаємо форму відповіді
      setReplyData({
        requestId: "",
        userId: "",
        requestNumber: "",
        userEmail: "",
        response: ""
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: "Помилка при відправленні відповіді"
      }));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentRequest({
      problemDescription: "",
      status: "open"
    });
    setEditMode(false);
    setErrors({
      problemDescription: "",
      response: "",
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

  const handleCloseReplyModal = () => {
    setReplyData({
      requestId: "",
      userId: "",
      requestNumber: "",
      userEmail: "",
      response: ""
    });
    setErrors(prev => ({
      ...prev,
      response: "",
      submit: ""
    }));
    setShowReplyModal(false);
  };

  const handleEdit = (request) => {
    setCurrentRequest({
      ...request
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleOpenReplyModal = (request) => {
    // Extract the user ID correctly based on your data structure
    const userId = request.userId?._id || request.userId;
    
    // Get the user email from the request
    // Assuming the user object has an email property
    const userEmail = request.userId?.email || "Користувач без email";
    
    setReplyData({
      requestId: request._id,
      userId: userId,
      requestNumber: request.requestNumber,
      userEmail: userEmail,
      response: ""
    });
    setCurrentRequest(request); // Store the current request to display its details
    setShowReplyModal(true);
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    setLoading(true);
    try {
      await dispatch(updateRequestStatusAction(requestId, { status: newStatus }));
      
      // Refresh requests list
      if (user?.role === 'admin' || user?.role === 'support') {
        await dispatch(getAllRequestsAction());
      } else if (user?._id) {
        await dispatch(findRequestsAction(null, user._id));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: "Помилка при оновленні статусу запиту"
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (requestId) => {
    setRequestToDelete(requestId);
    setConfirmDelete(true);
  };

  const confirmDeleteRequest = async () => {
    setLoading(true);
    try {
      await dispatch(deleteRequestAction(requestToDelete));
      
      // Refresh requests list
      if (user?.role === 'admin' || user?.role === 'support') {
        await dispatch(getAllRequestsAction());
      } else if (user?._id) {
        await dispatch(findRequestsAction(null, user._id));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: "Помилка при видаленні запиту"
      }));
    } finally {
      setLoading(false);
      setConfirmDelete(false);
      setRequestToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge bg="primary">Відкрито</Badge>;
      case 'in_progress':
        return <Badge bg="warning">В роботі</Badge>;
      case 'closed':
        return <Badge bg="secondary">Закрито</Badge>;
      default:
        return <Badge bg="light">Невідомо</Badge>;
    }
  };

  return (
    <div className="container mt-4">
      <h2>Запити підтримки</h2>
      {error && (
        <Alert variant="danger" onClose={handleErrorClose} dismissible>
          {error}
        </Alert>
      )}
      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex gap-2 w-75">
          <Form.Control
            type="text"
            placeholder="Пошук за номером або описом..."
            value={search}
            onChange={handleSearch}
            className="w-50"
            disabled={loading}
          />
          <Form.Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            disabled={loading}
            className="w-25"
          >
            <option value="all">Всі статуси</option>
            <option value="open">Відкрито</option>
            <option value="in_progress">В роботі</option>
            <option value="closed">Закрито</option>
          </Form.Select>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowModal(true); }} 
          disabled={loading || (user?.role !== 'client' && user?.role !== 'admin')}
        >
          Створити запит
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
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div className="col-md-4 mb-3" key={request._id}>
                <Card>
                  <Card.Body>
                    <Card.Title>
                      Запит #{request.requestNumber}
                    </Card.Title>
                    <Card.Text>
                      <div className="mb-2">
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="mt-2 mb-3">
                        {request.problemDescription.length > 100 
                          ? `${request.problemDescription.substring(0, 100)}...` 
                          : request.problemDescription}
                      </div>
                      <div className="mt-2 d-flex gap-2 flex-wrap">
                        {/* Changed from "Детальніше" to "Відповісти" button */}
                        <Button 
                          variant="primary"
                          onClick={() => handleOpenReplyModal(request)}
                        >
                          Відповісти
                        </Button>
                        
                        {/* Status update buttons for admin and support */}
                        {(user?.role === 'admin' || user?.role === 'support') && (
                          <>
                            {request.status === 'open' && (
                              <Button 
                                variant="warning"
                                onClick={() => handleUpdateStatus(request._id, 'in_progress')}
                              >
                                Взяти в роботу
                              </Button>
                            )}
                            {request.status === 'in_progress' && (
                              <Button 
                                variant="secondary"
                                onClick={() => handleUpdateStatus(request._id, 'closed')}
                              >
                                Закрити
                              </Button>
                            )}
                            {request.status === 'closed' && (
                              <Button 
                                variant="outline-primary"
                                onClick={() => handleUpdateStatus(request._id, 'open')}
                              >
                                Відкрити знову
                              </Button>
                            )}
                          </>
                        )}
                        
                        {/* Edit and delete buttons for admins and request owners */}
                        {(user?.role === 'admin' || 
                          (user?._id === request.userId || 
                           user?._id === request.userId?._id)) && (
                          <>
                            <Button 
                              variant="warning"
                              onClick={() => handleEdit(request)}
                            >
                              Редагувати
                            </Button>
                            <Button 
                              variant="danger"
                              onClick={() => handleDelete(request._id)}
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
              Запитів за даними критеріями не знайдено
            </p>
          )}
        </div>
      )}

      {/* Modal for adding/editing request */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Редагувати запит" : "Створити запит"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errors && Object.values(errors).some(error => error) && (
            <div className="alert alert-danger">
              <ul>
                {Object.values(errors)
                  .filter(error => error)
                  .map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
              </ul>
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Опис проблеми</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="problemDescription"
                value={currentRequest.problemDescription}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            {(user?.role === 'admin' || user?.role === 'support') && (
              <Form.Group className="mt-3">
                <Form.Label>Статус</Form.Label>
                <Form.Select
                  name="status"
                  value={currentRequest.status}
                  onChange={handleChange}
                >
                  <option value="open">Відкрито</option>
                  <option value="in_progress">В роботі</option>
                  <option value="closed">Закрито</option>
                </Form.Select>
              </Form.Group>
            )}
            
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

      {/* New Reply modal */}
      <Modal show={showReplyModal} onHide={handleCloseReplyModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Відповідь на запит #{currentRequest.requestNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errors && (errors.response || errors.submit) && (
            <div className="alert alert-danger">
              <ul>
                {[errors.response, errors.submit]
                  .filter(error => error)
                  .map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
              </ul>
            </div>
          )}

          <div className="mb-4 border p-3 bg-light">
            <h5>Інформація про запит</h5>
            <p><strong>Статус:</strong> {getStatusBadge(currentRequest.status)}</p>
            <p><strong>Від користувача:</strong> {replyData.userEmail}</p>
            <p><strong>Опис проблеми:</strong></p>
            <p>{currentRequest.problemDescription}</p>
          </div>

          <Form onSubmit={handleReplySubmit}>
            <Form.Group>
              <Form.Label>Ваша відповідь</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="response"
                value={replyData.response}
                onChange={handleReplyChange}
                required
              />
              <Form.Text className="text-muted">
                Відповідаючи на запит, номер запиту та дані користувача будуть автоматично включені.
              </Form.Text>
            </Form.Group>
            
            {/* Hidden fields section showing the automatically added data */}
            <div className="mt-3 mb-3 p-2 bg-light border">
              <small>
                <div><strong>Номер запиту:</strong> #{replyData.requestNumber}</div>
                <div><strong>Відповідач:</strong> {user?.email || user?.name || "Невідомий користувач"}</div>
              </small>
            </div>
            
            <Button
              type="submit"
              className="btn btn-primary w-100 mt-3"
              disabled={loading}
            >
              {loading ? "Відправлення..." : "Відправити відповідь"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Підтвердження видалення</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Ви впевнені, що хочете видалити цей запит?</p>
          <p>Ця дія є незворотною.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Скасувати
          </Button>
          <Button variant="danger" onClick={confirmDeleteRequest} disabled={loading}>
            {loading ? "Видалення..." : "Видалити"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RequestsPage;