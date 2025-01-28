import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Helper function to check authentication and role
const getTokenData = () => {
  const token = sessionStorage.getItem("token");
  if (!token) return null;

  try {
    return jwtDecode(token); // Decode the token payload
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

// PrivateRoute for general authentication check
const PrivateRoute = ({ children }) => {
  const tokenData = getTokenData();
  const isAuthenticated = !!tokenData; // Check if token is present and valid

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// UserRoute for user role-based access
const UserRoute = ({ children }) => {
  const tokenData = getTokenData();
  const isAuthenticated = !!tokenData;
  const isUser = tokenData && !tokenData.is_admin; // Check if user is not admin

  return isAuthenticated && isUser ? children : <Navigate to="/login" />;
};

// AdminRoute for admin role-based access
const AdminRoute = ({ children }) => {
  const tokenData = getTokenData();
  const isAuthenticated = !!tokenData;
  const isAdmin = tokenData && tokenData.isAdmin; // Check if user is admin

  return isAuthenticated && isAdmin ? children : <Navigate to="/login" />;
};

export { PrivateRoute, UserRoute, AdminRoute };
