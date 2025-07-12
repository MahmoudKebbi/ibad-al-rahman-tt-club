import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import "./App.css";

import useAuth from "./hooks/useAuth";

import Login from "./pages/auth/Login";
import NotFound from "./pages/NotFound";
import GuestSignUp from "./pages/auth/GuestSignUp";

import AdminDashboard from "./pages/admin/AdminDashboard";
import MembersManagement from "./pages/admin/MembersManagement";
import MemberRegistrationForm from "./pages/admin/MemberRegistrationForm";
import ScheduleManagement from "./pages/admin/ScheduleManagement";
import SessionForm from "./pages/admin/SessionForm";
import PaymentManagement from "./pages/admin/PaymentManagement";

import PaymentRecordForm from "./pages/admin/PaymentRecordForm";
import PaymentReceipt from "./components/payment/PaymentReciept";

import MemberDashboard from "./pages/member/MemberDashboard";
import ScheduleView from "./pages/member/ScheduleView";
import ProfileView from "./pages/member/ProfileView";
import ProfileEdit from "./pages/member/ProfileEdit";
import ChangePassword from "./pages/member/ChangePassword";
import ProfilePhoto from "./pages/member/ProfilePhoto";
import MemberPayments from "./pages/member/MemberPayments";

import GuestDashboard from "./pages/guest/GuestDashboard";

import LoadingScreen from "./components/common/LoadingScreen";

import AttendanceManagement from "./pages/admin/AttendanceManagement";
import MemberCheckInPage from "./pages/admin/MemberCheckInPage";
import AttendanceDetails from "./components/admin/AttendanceDetails";
import MemberAttendance from "./pages/member/MemberAttendance";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    console.log("ProtectedRoute loading state:", loading);
    console.log("ProtectedRoute state:", { loading, isAuthenticated, user });
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log("ProtectedRoute: User is not authenticated");
    console.log("ProtectedRoute state:", { loading, isAuthenticated, user });
    console.log("User is not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check if the user's role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log("ProtectedRoute: User role not allowed");
    console.log("ProtectedRoute state:", { loading, isAuthenticated, user });
    console.log("User role not allowed, redirecting based on role");
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "member":
        return <Navigate to="/member" replace />;
      default:
        return <Navigate to="/guest" replace />;
    }
  }

  return children;
};

function App() {
  useAuth();

  const { isAuthenticated, user, role, loading } = useSelector(
    (state) => state.auth
  );

  const homeRouteRedirect = () => {
    console.log("homeRouteRedirect called with:", {
      isAuthenticated,
      role,
      loading,
    });

    if (loading) {
      return <LoadingScreen />;
    }

    if (!isAuthenticated) {
      console.log("User is not authenticated, redirecting to login");
      return <Navigate to="/login" replace />;
    }

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
    <Routes>
      {/* Home route redirects based on auth state */}
      <Route path="/" element={homeRouteRedirect()} />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? homeRouteRedirect() : <Login />}
      />
      <Route path="/signup" element={<GuestSignUp />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin - Members Management */}
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

      {/* Admin - Schedule Management */}
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

      {/* Admin - Payment Management */}
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PaymentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/members/:memberId/payment"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PaymentRecordForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments/:paymentId/receipt"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PaymentReceipt />
          </ProtectedRoute>
        }
      />

      {/* Admin - Attendance Management */}
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AttendanceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance/checkin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <MemberCheckInPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance/:attendanceId"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AttendanceDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance/:attendanceId/checkout"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AttendanceDetails />
          </ProtectedRoute>
        }
      />

      {/* Admin - Profile */}
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ProfileView />
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

      {/* Member - Schedule */}
      <Route
        path="/member/schedule"
        element={
          <ProtectedRoute allowedRoles={["member", "admin"]}>
            <ScheduleView />
          </ProtectedRoute>
        }
      />

      {/* Member - Profile */}
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

      {/* Member - Payments */}
      <Route
        path="/member/payments"
        element={
          <ProtectedRoute allowedRoles={["member"]}>
            <MemberPayments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/receipt/:paymentId"
        element={
          <ProtectedRoute>
            <PaymentReceipt />
          </ProtectedRoute>
        }
      />

      {/* Member - Attendance */}
      <Route
        path="/member/attendance"
        element={
          <ProtectedRoute allowedRoles={["member"]}>
            <MemberAttendance />
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
  );
}

export default App;
