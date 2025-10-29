import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingScreen from "../common/LoadingScreen";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, isLoading } = useSelector(
    (state) => state.auth,
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect based on the user's role
    if (role === "admin") {
      return <Navigate to="/admin" />;
    } else if (role === "member") {
      return <Navigate to="/member" />;
    } else if (role === "guest") {
      return <Navigate to="/guest" />;
    } else {
      // Fallback if role is unknown
      return <Navigate to="/login" />;
    }
  }

  // If all checks pass, render the children components
  return children;
};

export default ProtectedRoute;
