import Messenger from "./components/Messenger.jsx";
import React from "react";
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import HomePage from "./pages/HomePage/HomePage.jsx";
import SearchPage from "./pages/SearchPage/SearchPage.jsx";
import AdminPage from "./pages/AdminPage/AdminPage.jsx";
import UserLogin from "./pages/LoginPage/User/UserLogin.jsx";
import UserSignin from "./pages/LoginPage/User/UserSignin.jsx";
import authService from "./components/LoginPage/LoginProcess/ValidateLogin.jsx";
import FriendPage from "./pages/FriendPage/FriendPage.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const user = authService.getCurrentUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login/*" element={<UserLogin />} />
      <Route path="/signin/*" element={<UserSignin />} />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/friends"
        element={
          <PrivateRoute>
            <FriendPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <Messenger />
          </PrivateRoute>
        }
      />
      <Route
        path="/search/:type"
        element={
          <PrivateRoute>
            <SearchPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <PrivateRoute>
            <AdminPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;