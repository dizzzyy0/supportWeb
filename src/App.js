import logo from './logo.svg';
import Login from "./utils/components/Login.jsx";
import Register from "./utils/components/Register.jsx";
import Navigation from "./utils/components/Navigation.jsx";
import UsersPage from "./utils/pages/admin/usersPage.jsx";
import UserDetailsPage from "./utils/pages/client/details.jsx";
import ResponsesPage from "./utils/pages/admin/responsesPage.jsx";
import RequestsPage from "./utils/pages/admin/requestsPage.jsx";
import { AuthProvider } from "./contexts/AuthContext.js";
import './App.css';
import { ToastContainer } from "react-bootstrap";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./contexts/PrivateRoute.js";

function App() {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="content">
      <Navigation/>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/usersPage"
            element={
              <PrivateRoute role="admin">
                <UsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/responsesPage"
            element={
              <PrivateRoute role="support">
                <ResponsesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/requestsPage"
            element={
              <PrivateRoute role="admin">
                <RequestsPage />
              </PrivateRoute>
            }
          />
          <Route path="userDetail/:userId" element={<UserDetailsPage role="client" />} />
          <Route path="userDetail" element={<UserDetailsPage role="client" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
