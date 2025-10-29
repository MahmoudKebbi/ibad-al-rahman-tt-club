import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatsCard from "../../components/dashboard/StatsCard";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/common/DataTable";
import ActionButton from "../../components/common/ActionButton";
import ContentCard from "../../components/layout/ContentCard";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../services/firebase/config";
import { useNavigate } from "react-router-dom";
import {
  getAttendanceStats,
  getAllAttendanceRecords,
} from "../../services/firebase/attendance";
import { formatTime, AttendanceStatus } from "../../models/Attendance";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    scheduledSessions: 0,
    pendingPayments: 0,
    todayAttendance: 0,
    currentlyCheckedIn: 0,
  });

  const [recentMembers, setRecentMembers] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch users count
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const totalMembers = usersSnapshot.size;

        // Count active members (non-guest users)
        const activeMembers = usersSnapshot.docs.filter(
          (doc) => doc.data().role === "member" || doc.data().role === "admin",
        ).length;

        // Fetch recent members
        const recentMembersQuery = query(
          collection(db, "users"),
          orderBy("createdAt", "desc"),
          limit(5),
        );
        const recentMembersSnapshot = await getDocs(recentMembersQuery);
        const recentMembersData = recentMembersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt:
            doc.data().createdAt?.toDate().toLocaleDateString() || "N/A",
        }));

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch attendance statistics
        const attendanceStats = await getAttendanceStats(today);

        // Fetch recent attendance records
        const recentAttendanceData = await getAllAttendanceRecords({
          limit: 5,
          startDate: today,
        });

        setRecentAttendance(recentAttendanceData);

        // Set data
        setStats({
          totalMembers,
          activeMembers,
          scheduledSessions: 12, // For demo purposes
          pendingPayments: 5, // For demo purposes
          todayAttendance: attendanceStats.totalAttendance,
          currentlyCheckedIn: attendanceStats.checkedIn,
        });

        setRecentMembers(recentMembersData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAddNewMember = () => {
    navigate("/admin/members/new");
  };

  const handleScheduleSession = () => {
    navigate("/admin/schedule/create");
  };

  const handleCheckIn = () => {
    navigate("/admin/attendance/checkin");
  };

  const handleAttendanceManagement = () => {
    navigate("/admin/attendance");
  };

  // Define columns for the recent members table
  const memberColumns = [
    {
      title: "Name",
      field: "displayName",
      render: (member) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            {member.photoURL ? (
              <img
                src={member.photoURL}
                alt={member.displayName}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <span className="text-lg font-medium text-gray-600">
                {member.displayName?.charAt(0) || "?"}
              </span>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {member.displayName}
            </div>
            <div className="text-sm text-gray-500">
              {member.phoneNumber || "No phone"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      field: "email",
      render: (member) => (
        <div className="text-sm text-gray-500">
          {member.email || "No email"}
        </div>
      ),
    },
    {
      title: "Role",
      field: "role",
      render: (member) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${
            member.role === "admin"
              ? "bg-purple-100 text-purple-800"
              : member.role === "member"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {member.role}
        </span>
      ),
    },
    {
      title: "Joined",
      field: "createdAt",
    },
  ];

  // Define columns for the recent attendance table
  const attendanceColumns = [
    {
      title: "Member",
      field: "memberName",
      render: (record) => (
        <div
          className="text-sm font-medium text-green-600 cursor-pointer hover:underline"
          onClick={() => navigate(`/admin/members/${record.memberId}`)}
        >
          {record.memberName}
        </div>
      ),
    },
    {
      title: "Check-In",
      field: "checkInTime",
      render: (record) => formatTime(record.checkInTime),
    },
    {
      title: "Status",
      field: "status",
      render: (record) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            record.status === AttendanceStatus.CHECKED_IN
              ? "bg-green-100 text-green-800"
              : record.status === AttendanceStatus.CHECKED_OUT
                ? "bg-blue-100 text-blue-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {record.status === AttendanceStatus.CHECKED_IN
            ? "Checked In"
            : record.status === AttendanceStatus.CHECKED_OUT
              ? "Checked Out"
              : "No Show"}
        </span>
      ),
    },
    {
      title: "Type",
      field: "attendanceType",
      render: (record) => (
        <span className="capitalize">{record.attendanceType}</span>
      ),
    },
    {
      title: "Actions",
      field: "actions",
      render: (record) => (
        <div className="flex space-x-2">
          {record.status === AttendanceStatus.CHECKED_IN && (
            <ActionButton
              size="sm"
              color="red"
              onClick={() =>
                navigate(`/admin/attendance/${record.id}/checkout`)
              }
            >
              Check Out
            </ActionButton>
          )}
          <ActionButton
            size="sm"
            color="blue"
            onClick={() => navigate(`/admin/attendance/${record.id}`)}
          >
            Details
          </ActionButton>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader title="Dashboard Overview" />

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Members"
            value={loading ? "..." : stats.totalMembers}
            icon={
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            color="green"
          />

          <StatsCard
            title="Active Members"
            value={loading ? "..." : stats.activeMembers}
            icon={
              <svg
                className="h-8 w-8"
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
            }
            color="blue"
          />

          <StatsCard
            title="Today's Attendance"
            value={loading ? "..." : stats.todayAttendance}
            icon={
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
            color="purple"
          />

          <StatsCard
            title="Currently Checked In"
            value={loading ? "..." : stats.currentlyCheckedIn}
            icon={
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent members */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Members
            </h3>
            <DataTable
              columns={memberColumns}
              data={recentMembers}
              isLoading={loading}
              emptyMessage="No members found"
              footerContent={
                <a
                  href="/admin/members"
                  className="text-sm font-medium text-green-600 hover:text-green-500"
                >
                  View all members
                </a>
              }
            />
          </div>

          {/* Today's Attendance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Today's Attendance
            </h3>
            <DataTable
              columns={attendanceColumns}
              data={recentAttendance}
              isLoading={loading}
              emptyMessage="No attendance records for today"
              footerContent={
                <a
                  href="/admin/attendance"
                  className="text-sm font-medium text-green-600 hover:text-green-500"
                >
                  View all attendance records
                </a>
              }
            />
          </div>
        </div>

        {/* Quick actions */}
        <ContentCard title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ActionButton
              color="green"
              onClick={handleAddNewMember}
              icon={
                <svg
                  className="h-5 w-5"
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
              }
            >
              Add New Member
            </ActionButton>

            <ActionButton
              color="blue"
              onClick={handleScheduleSession}
              icon={
                <svg
                  className="h-5 w-5"
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
              }
            >
              Schedule Session
            </ActionButton>

            <ActionButton
              color="purple"
              onClick={handleCheckIn}
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
            >
              Member Check-In
            </ActionButton>

            <ActionButton
              color="red"
              onClick={handleAttendanceManagement}
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            >
              Attendance Reports
            </ActionButton>
          </div>
        </ContentCard>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
