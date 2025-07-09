import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import "./App.css";

// Custom hooks
import useAuth from "./hooks/useAuth";

// Auth Pages
import Login from "./pages/auth/Login";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import MembersManagement from "./pages/admin/MembersManagement";
import MemberRegistrationForm from "./pages/admin/MemberRegistrationForm";
import ScheduleManagement from "./pages/admin/ScheduleManagement";
import SessionForm from "./pages/admin/SessionForm";

// Member Pages
import MemberDashboard from "./pages/member/MemberDashboard";
import ScheduleView from "./pages/member/ScheduleView";
import ProfileView from "./pages/member/ProfileView";
import ProfileEdit from "./pages/member/ProfileEdit";
import ChangePassword from "./pages/member/ChangePassword";
import ProfilePhoto from "./pages/member/ProfilePhoto";

// Guest Pages
import GuestDashboard from "./pages/guest/GuestDashboard";

// Loading Screen Component
import LoadingScreen from "./components/common/LoadingScreen";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useSelector(
    (state) => state.auth
  );

  if (loading) {
    // Show loading spinner while checking auth
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log("User", "************* ", user, "************ ", isAuthenticated);
    console.log(
      "User is not authenticated, redirecting to login",
      " ",
      user,
      " ",
      isAuthenticated
    );
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has an allowed role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log(
      "User role not allowed, redirecting based on role",
      " ",
      user.role
    );
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "member":
        return <Navigate to="/member" replace />;
      default:
        return <Navigate to="/guest" replace />;
    }
  }

  // User is authenticated and has an allowed role
  return children;
};

function App() {
  // Use the auth hook to subscribe to authentication state
  useAuth();

  const { isAuthenticated, user, role, loading } = useSelector(
    (state) => state.auth
  );

  // Helper function to redirect based on auth state and role
  const homeRouteRedirect = () => {
    console.log("homeRouteRedirect called with:", {
      isAuthenticated,
      role, // Access role directly from state.auth.role
      loading,
    });

    if (loading) {
      return <LoadingScreen />;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // Use role directly from state.auth
    console.log(`User has role: ${role}, redirecting to /${role}`);
    switch (role) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "member":
        return <Navigate to="/member" replace />;
      case "guest":
        return <Navigate to="/guest" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Router>
      <Routes>
        {/* Home route redirects based on auth state */}
        <Route path="/" element={homeRouteRedirect()} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? homeRouteRedirect() : <Login />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/members"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MembersManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/members/new"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MemberRegistrationForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/schedule"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ScheduleManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/schedule/create"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SessionForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/schedule/edit/:sessionId"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SessionForm />
            </ProtectedRoute>
          }
        />

        {/* Member Routes */}
        <Route
          path="/member"
          element={
            <ProtectedRoute allowedRoles={["member", "admin"]}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/member/schedule"
          element={
            <ProtectedRoute allowedRoles={["member", "admin"]}>
              <ScheduleView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/member/profile"
          element={
            <ProtectedRoute allowedRoles={["member", "admin"]}>
              <ProfileView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/member/profile/edit"
          element={
            <ProtectedRoute allowedRoles={["member", "admin"]}>
              <ProfileEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/member/profile/password"
          element={
            <ProtectedRoute allowedRoles={["member", "admin"]}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/member/profile/photo"
          element={
            <ProtectedRoute allowedRoles={["member", "admin"]}>
              <ProfilePhoto />
            </ProtectedRoute>
          }
        />

        {/* Guest Routes */}
        <Route
          path="/guest"
          element={
            <ProtectedRoute allowedRoles={["guest", "member", "admin"]}>
              <GuestDashboard />
            </ProtectedRoute>
          }
        />

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
