import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  getMemberAttendanceRecords,
  getCurrentAttendance,
} from "../../services/firebase/attendance";
import {
  formatTime,
  formatDate,
  calculateDuration,
  AttendanceStatus,
} from "../../models/Attendance";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/layout/PageHeader";
import ContentCard from "../../components/layout/ContentCard";
import DataTable from "../../components/common/DataTable";
import InputField from "../../components/common/InputField";

const MemberAttendance = () => {
  const { user } = useSelector((state) => state.auth);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0], // 30 days ago
    endDate: new Date().toISOString().split("T")[0], // Today
  });

  // Fetch attendance records and current status
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError(null);

        // Convert string dates to Date objects
        const startDate = filters.startDate
          ? new Date(filters.startDate)
          : undefined;
        const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

        // Make sure endDate is end of day
        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
        }

        // Fetch in parallel
        const [records, current] = await Promise.all([
          getMemberAttendanceRecords(user.uid, { startDate, endDate }),
          getCurrentAttendance(user.uid),
        ]);

        setAttendanceRecords(records);
        setCurrentRecord(current);
      } catch (err) {
        console.error("Error fetching attendance data:", err);
        setError("Failed to load your attendance history");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Column definitions for DataTable
  const columns = [
    {
      title: "Date",
      field: "checkInTime",
      render: (row) => formatDate(row.checkInTime),
    },
    {
      title: "Check-In",
      field: "checkInTime",
      render: (row) => formatTime(row.checkInTime),
    },
    {
      title: "Check-Out",
      field: "checkOutTime",
      render: (row) => (row.checkOutTime ? formatTime(row.checkOutTime) : "—"),
    },
    {
      title: "Duration",
      field: "duration",
      render: (row) =>
        row.checkOutTime
          ? calculateDuration(row.checkInTime, row.checkOutTime)
          : "—",
    },
    {
      title: "Type",
      field: "attendanceType",
      render: (row) => <span className="capitalize">{row.attendanceType}</span>,
    },
    {
      title: "Status",
      field: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.status === AttendanceStatus.CHECKED_IN
              ? "bg-green-100 text-green-800"
              : row.status === AttendanceStatus.CHECKED_OUT
                ? "bg-blue-100 text-blue-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {row.status === AttendanceStatus.CHECKED_IN
            ? "Checked In"
            : row.status === AttendanceStatus.CHECKED_OUT
              ? "Checked Out"
              : "No Show"}
        </span>
      ),
    },
  ];

  // Calculate attendance statistics
  const calculateStats = () => {
    const totalSessions = attendanceRecords.length;
    const completedSessions = attendanceRecords.filter(
      (r) => r.status === AttendanceStatus.CHECKED_OUT,
    ).length;
    const totalDuration = attendanceRecords.reduce((total, record) => {
      if (record.checkOutTime) {
        const duration =
          (new Date(record.checkOutTime) - new Date(record.checkInTime)) /
          (1000 * 60); // minutes
        return total + duration;
      }
      return total;
    }, 0);

    // Average duration in minutes
    const avgDuration =
      completedSessions > 0 ? Math.round(totalDuration / completedSessions) : 0;

    // Format as hours and minutes
    const avgHours = Math.floor(avgDuration / 60);
    const avgMinutes = avgDuration % 60;

    const avgDurationFormatted =
      avgHours > 0
        ? `${avgHours} hr${avgHours !== 1 ? "s" : ""} ${avgMinutes} min${avgMinutes !== 1 ? "s" : ""}`
        : `${avgMinutes} min${avgMinutes !== 1 ? "s" : ""}`;

    return {
      totalSessions,
      completedSessions,
      totalDuration,
      avgDurationFormatted,
    };
  };

  const stats = calculateStats();

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader title="My Attendance History" />

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Status Card */}
        <ContentCard className="mb-6">
          <div className="flex items-center">
            <div
              className={`rounded-full p-3 ${
                currentRecord
                  ? "bg-green-100 text-green-600"
                  : "bg-blue-100 text-blue-600"
              }`}
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-800">
                Current Attendance Status
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {currentRecord ? (
                  <>
                    You are currently checked in. Check-in time:{" "}
                    {formatTime(currentRecord.checkInTime)} on{" "}
                    {formatDate(currentRecord.checkInTime)}
                  </>
                ) : (
                  "You are not currently checked in."
                )}
              </p>
            </div>
          </div>
        </ContentCard>

        {/* Attendance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Sessions</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {stats.totalSessions}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3 text-blue-600">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Completed Sessions</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {stats.completedSessions}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3 text-green-600">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Average Session</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {stats.avgDurationFormatted}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3 text-purple-600">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Date Range</p>
                <p className="text-xl font-semibold text-gray-800">30 Days</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3 text-yellow-600">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <ContentCard title="Date Range Filter" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Start Date"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />

            <InputField
              label="End Date"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>
              Showing attendance records from{" "}
              {formatDate(new Date(filters.startDate))} to{" "}
              {formatDate(new Date(filters.endDate))}
            </p>
          </div>
        </ContentCard>

        {/* Attendance Records */}
        <ContentCard title="Attendance Records" noPadding>
          <DataTable
            columns={columns}
            data={attendanceRecords}
            isLoading={loading}
            emptyMessage="No attendance records found for the selected date range."
          />
        </ContentCard>
      </div>
    </DashboardLayout>
  );
};

export default MemberAttendance;
