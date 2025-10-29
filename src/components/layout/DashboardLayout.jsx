import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../services/firebase/auth";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Handle sign out
  const handlelogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Get current date/time in UTC
  const currentDateTime = new Date()
    .toISOString()
    .replace("T", " ")
    .substring(0, 19);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-gray-600 bg-opacity-75 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div
        className={`md:flex md:flex-shrink-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:relative z-40 md:z-auto inset-y-0 left-0 h-screen`}
      >
        <div className="flex flex-col w-64 bg-green-700 text-white h-full overflow-y-auto">
          <div className="h-16 flex items-center px-4 bg-green-800">
            <h2 className="text-xl font-bold">Ibad Al Rahman TTC</h2>
            <button
              className="md:hidden ml-auto text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-4 border-b border-green-600">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-lg font-medium">
                  {user?.displayName?.charAt(0) || "U"}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {user?.displayName || "User"}
                </p>
                <p className="text-xs text-green-200">
                  {role?.charAt(0).toUpperCase() + role?.slice(1) || "User"}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            {role === "admin" && (
              <>
                <Link
                  to="/admin"
                  className={`mb-1 flex items-center px-4 py-2 rounded-md ${location.pathname === "/admin" ? "bg-green-800" : "hover:bg-green-600"}`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  to="/admin/members"
                  className={`mb-1 flex items-center px-4 py-2 rounded-md ${location.pathname.includes("/admin/members") ? "bg-green-800" : "hover:bg-green-600"}`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Members
                </Link>
                <Link
                  to="/admin/schedule"
                  className={`mb-1 flex items-center px-4 py-2 rounded-md ${location.pathname.includes("/admin/schedule") ? "bg-green-800" : "hover:bg-green-600"}`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Schedule
                </Link>
                <Link
                  to="/admin/payments"
                  className={`mb-1 flex items-center px-4 py-2 rounded-md ${location.pathname.includes("/admin/payments") ? "bg-green-800" : "hover:bg-green-600"}`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                  Payments
                </Link>
                <Link
                  to="/admin/settings"
                  className={`mb-1 flex items-center px-4 py-2 rounded-md ${location.pathname.includes("/admin/settings") ? "bg-green-800" : "hover:bg-green-600"}`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Settings
                </Link>
              </>
            )}

            {role === "member" && (
              <>
                <Link
                  to="/member"
                  className={`mb-1 flex items-center px-4 py-2 rounded-md ${location.pathname === "/member" ? "bg-green-800" : "hover:bg-green-600"}`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  to="/member/schedule"
                  className={`mb-1 flex items-center px-4 py-2 rounded-md ${location.pathname.includes("/member/schedule") ? "bg-green-800" : "hover:bg-green-600"}`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Schedule
                </Link>
                <Link
                  to="/member/payments"
                  className={`mb-1 flex items-center px-4 py-2 rounded-md ${location.pathname.includes("/member/payments") ? "bg-green-800" : "hover:bg-green-600"}`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                  Payments
                </Link>
                <Link
                  to="/member/profile"
                  className={`mb-1 flex items-center px-4 py-2 rounded-md ${location.pathname.includes("/member/profile") ? "bg-green-800" : "hover:bg-green-600"}`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </Link>
              </>
            )}

            {role === "guest" && (
              <>
                <Link
                  to="/guest"
                  className={`mb-1 flex items-center px-4 py-2 rounded-md ${location.pathname === "/guest" ? "bg-green-800" : "hover:bg-green-600"}`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  to="/guest/schedule"
                  className={`mb-1 flex items-center px-4 py-2 rounded-md ${location.pathname.includes("/guest/schedule") ? "bg-green-800" : "hover:bg-green-600"}`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Schedule
                </Link>
                <Link
                  to="/guest/register"
                  className={`mb-1 flex items-center px-4 py-2 rounded-md ${location.pathname.includes("/guest/register") ? "bg-green-800" : "hover:bg-green-600"}`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Register as Member
                </Link>
              </>
            )}

            <div className="pt-4 mt-6 border-t border-green-600">
              <button
                onClick={handlelogout}
                className="flex w-full items-center px-4 py-2 text-white rounded-md hover:bg-green-600"
              >
                <svg
                  className="mr-3 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign out
              </button>
            </div>
          </nav>
        </div>
      </div>

      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="md:hidden px-4 text-gray-500 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">
                {role === "admin" && "Admin Dashboard"}
                {role === "member" && "Member Dashboard"}
                {role === "guest" && "Guest Dashboard"}
                {role === "coach" && "Coach Dashboard"}
              </h1>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
