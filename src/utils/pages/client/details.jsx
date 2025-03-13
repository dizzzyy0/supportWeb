import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Button, Card, Form, Modal, Spinner, Alert, Table, Badge } from "react-bootstrap";
import { getUserByIdAction, updateUserAction } from "../../../redux/actions/userAction";
import { getAllRequestsAction, createRequestAction } from "../../../redux/actions/requestAction";
import { getAllResponsesAction } from "../../../redux/actions/responseAction";
import { AuthService } from "../../../services/authService";

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const { userId } = useParams(); 
  const { requests, loading: requestsLoading } = useSelector((state) => state.requests);
  const { responses } = useSelector((state) => state.responses);
  
  // Local state for viewed user and current user
  const [viewedUser, setViewedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // User edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserData, setEditUserData] = useState({
    username: "",
    surename: "",
    email: ""
  });
  
  // New request state
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    problemDescription: "",
    priority: "medium"
  });
  
  // Request detail state
  const [showRequestDetailModal, setShowRequestDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Validation errors
  const [errors, setErrors] = useState({
    username: "",
    surename: "",
    email: "",
    problemDescription: "",
    submit: ""
  });

  // Fetch user data and requests
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get current logged-in user
        const loggedInUser = await AuthService.getCurrentUser();
        setCurrentUser(loggedInUser);
        
        // If userId is provided, fetch that user's profile
        // Otherwise, show the current user's profile
        const profileUserId = userId || loggedInUser._id;
        
        console.log(`profileUserId:${profileUserId}`);
        // Check if viewing own profile
        setIsCurrentUserProfile(profileUserId === loggedInUser._id);
        
        // If viewing someone else's profile, fetch their data
        if (profileUserId !== loggedInUser._id) {
          const userProfile = await dispatch(getUserByIdAction(profileUserId));
          console.log("Отриманий профіль користувача:", userProfile);
          setViewedUser(userProfile);
        } else {
          setViewedUser(loggedInUser);
        }
        
        // Fetch all requests and responses
        await Promise.all([
          dispatch(getAllRequestsAction()),
          dispatch(getAllResponsesAction())
        ]);
      } catch (err) {
        console.error("Помилка отримання даних:", err);
        setError("Не вдалося завантажити дані користувача");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, userId]);
  
  // Filter requests for viewed user
  const userRequests = requests?.filter(request => 
    request.userId === viewedUser?._id
  ) || [];

  // Get responses for a specific request
  const getRequestResponses = (requestId) => {
    if (!responses) return [];
    return responses.filter(response => response.requestId === requestId);
  };

  // Format date
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

  // Get status text and variant
  const getStatusInfo = (status) => {
    switch (status) {
      case 'open':
        return { text: 'Відкритий', variant: 'primary' };
      case 'in_progress':
        return { text: 'В процесі', variant: 'warning' };
      case 'closed':
        return { text: 'Закритий', variant: 'success' };
      default:
        return { text: 'Невідомий', variant: 'secondary' };
    }
  };

  // Handle edit user - only for current user's profile
  const handleEditUser = () => {
    if (!isCurrentUserProfile || !viewedUser) return;
    
    setEditUserData({
      username: viewedUser.username || "",
      surename: viewedUser.surename || "",
      email: viewedUser.email || ""
    });
    
    setShowEditModal(true);
  };

  // Handle input change for edit form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUserData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation errors when typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
        submit: ""
      }));
    }
  };

  // Handle submit edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation and security check
    if (!isCurrentUserProfile) return;
    
    // Validate form
    let hasErrors = false;
    const newErrors = { ...errors };
    
    if (!editUserData.username.trim()) {
      newErrors.username = "Ім'я користувача обов'язкове";
      hasErrors = true;
    }
    
    if (!editUserData.surename.trim()) {
      newErrors.surename = "Прізвище обов'язкове";
      hasErrors = true;
    }
    
    if (!editUserData.email.trim()) {
      newErrors.email = "Email обов'язковий";
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(editUserData.email)) {
      newErrors.email = "Невірний формат email";
      hasErrors = true;
    }
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await dispatch(updateUserAction(viewedUser._id, editUserData));
      
      // Update local state
      setViewedUser(prev => ({
        ...prev,
        ...editUserData
      }));
      
      setShowEditModal(false);
    } catch (err) {
      console.error("Помилка оновлення користувача:", err);
      setErrors(prev => ({
        ...prev,
        submit: "Помилка при оновленні даних"
      }));
    }
  };

  // Handle new request - only for current user
  const handleNewRequest = () => {
    if (!isCurrentUserProfile) return;
    
    setNewRequest({
      problemDescription: "",
      priority: "medium"
    });
    
    setShowNewRequestModal(true);
  };

  // Handle input change for new request form
  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setNewRequest(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation errors when typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
        submit: ""
      }));
    }
  };

  // Handle submit new request form
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    // Security check
    if (!isCurrentUserProfile) return;
    
    // Validate form
    if (!newRequest.problemDescription.trim()) {
      setErrors(prev => ({
        ...prev,
        problemDescription: "Опис проблеми обов'язковий",
      }));
      return;
    }
    
    try {
      const requestData = {
        ...newRequest,
        userId: currentUser._id,
        status: 'open'
      };
      
      await dispatch(createRequestAction(requestData));
      
      // Reload requests
      dispatch(getAllRequestsAction());
      
      setShowNewRequestModal(false);
    } catch (err) {
      console.error("Помилка створення запиту:", err);
      setErrors(prev => ({
        ...prev,
        submit: "Помилка при створенні запиту"
      }));
    }
  };

  // Handle show request details
  const handleShowRequestDetail = (request) => {
    setSelectedRequest(request);
    setShowRequestDetailModal(true);
  };

  // Render loading spinner
  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </Spinner>
      </div>
    );
  }

  // Render error message
  if (error) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">
          {error}
        </Alert>
      </div>
    );
  }

  // Render user not found
  if (!viewedUser) {
    return (
      <div className="container mt-5">
        <Alert variant="warning">
          Користувача не знайдено
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* User profile section */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2 className="mb-3">
                {isCurrentUserProfile ? "Ваш профіль" : "Профіль користувача"}
                {!isCurrentUserProfile && (
                  <span className="ms-2">
                    {viewedUser.username} {viewedUser.surename}
                  </span>
                )}
              </h2>
              <div className="mb-3">
                <strong>Повне ім'я:</strong> {viewedUser.username} {viewedUser.surename}
              </div>
              <div className="mb-3">
                <strong>Email:</strong> {viewedUser.email}
              </div>
              {/* Show role only for admin and support */}
              {viewedUser.role && viewedUser.role !== 'client' && (
                <div className="mb-3">
                  <strong>Роль:</strong> {
                    viewedUser.role === 'admin' ? 'Адміністратор' : 
                    viewedUser.role === 'support' ? 'Підтримка' : 
                    viewedUser.role
                  }
                </div>
              )}
            </div>
            {/* Edit button only for own profile */}
            {isCurrentUserProfile && (
              <Button 
                variant="primary" 
                onClick={handleEditUser}
              >
                Редагувати профіль
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* User requests section */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>
              {isCurrentUserProfile ? "Ваші запити" : "Запити користувача"}
            </h3>
            {/* New request button only for own profile */}
            {isCurrentUserProfile && (
              <Button 
                variant="success" 
                onClick={handleNewRequest}
              >
                Створити новий запит
              </Button>
            )}
          </div>

          {userRequests.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Номер</th>
                  <th>Статус</th>
                  <th>Опис проблеми</th>
                  <th>Відповіді</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {userRequests.map((request) => {
                  const { text: statusText, variant: statusVariant } = getStatusInfo(request.status);
                  const requestResponses = getRequestResponses(request._id);
                  
                  return (
                    <tr key={request._id}>
                      <td>#{request.requestNumber}</td>
                      <td>
                        <Badge bg={statusVariant}>{statusText}</Badge>
                      </td>
                      <td>
                        {request.problemDescription.length > 100 
                          ? `${request.problemDescription.substring(0, 100)}...` 
                          : request.problemDescription}
                      </td>
                      <td>{requestResponses.length}</td>
                      <td>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleShowRequestDetail(request)}
                        >
                          Деталі
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">
              {isCurrentUserProfile 
                ? "У вас ще немає запитів. Створіть новий запит, якщо вам потрібна допомога."
                : "У цього користувача поки що немає запитів."}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Edit User Modal - only for own profile */}
      {isCurrentUserProfile && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Редагування профілю</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {errors.submit && (
              <Alert variant="danger">
                {errors.submit}
              </Alert>
            )}

            <Form onSubmit={handleEditSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Ім'я</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={editUserData.username}
                  onChange={handleEditChange}
                  isInvalid={!!errors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Прізвище</Form.Label>
                <Form.Control
                  type="text"
                  name="surename"
                  value={editUserData.surename}
                  onChange={handleEditChange}
                  isInvalid={!!errors.surename}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.surename}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={editUserData.email}
                  onChange={handleEditChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-grid gap-2">
                <Button variant="primary" type="submit">
                  Зберегти зміни
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {/* New Request Modal - only for own profile */}
      {isCurrentUserProfile && (
        <Modal show={showNewRequestModal} onHide={() => setShowNewRequestModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Створити новий запит</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {errors.submit && (
              <Alert variant="danger">
                {errors.submit}
              </Alert>
            )}

            <Form onSubmit={handleRequestSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Опис проблеми</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="problemDescription"
                  value={newRequest.problemDescription}
                  onChange={handleRequestChange}
                  isInvalid={!!errors.problemDescription}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.problemDescription}
                </Form.Control.Feedback>
              </Form.Group>
              <div className="d-grid gap-2">
                <Button variant="success" type="submit">
                  Створити запит
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {/* Request Detail Modal */}
      <Modal
        show={showRequestDetailModal}
        onHide={() => setShowRequestDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Деталі запиту #{selectedRequest?.requestNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <div className="mb-3">
                <strong>Статус:</strong>{" "}
                <Badge bg={getStatusInfo(selectedRequest.status).variant}>
                  {getStatusInfo(selectedRequest.status).text}
                </Badge>
              </div>
              <div className="mb-3">
                <strong>Пріоритет:</strong>{" "}
                <Badge bg={
                  selectedRequest.priority === "high" ? "danger" :
                  selectedRequest.priority === "medium" ? "warning" : "info"
                }>
                  {selectedRequest.priority === "high" ? "Високий" :
                   selectedRequest.priority === "medium" ? "Середній" : "Низький"}
                </Badge>
              </div>
              <div className="mb-3">
                <strong>Створено:</strong> {formatDate(selectedRequest.createdAt)}
              </div>
              <div className="mb-3">
                <strong>Опис проблеми:</strong>
                <p className="mt-2 border-start ps-3">
                  {selectedRequest.problemDescription}
                </p>
              </div>

              <h5 className="mt-4 mb-3">Відповіді:</h5>
              {getRequestResponses(selectedRequest._id).length > 0 ? (
                <div>
                  {getRequestResponses(selectedRequest._id).map((response) => (
                    <Card key={response._id} className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>
                              {response.responderName || "Підтримка"}
                            </strong>
                          </div>
                          <div className="text-muted">
                            {formatDate(response.createdAt)}
                          </div>
                        </div>
                        <p className="mt-2">{response.responseText}</p>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert variant="info">
                  Поки що немає відповідей на цей запит.
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRequestDetailModal(false)}>
            Закрити
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserProfilePage;