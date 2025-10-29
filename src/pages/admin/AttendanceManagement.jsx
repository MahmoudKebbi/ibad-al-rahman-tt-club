import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllAttendanceRecords,
  getAttendanceStats,
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
import StatsCard from "../../components/dashboard/StatsCard";
import ActionButton from "../../components/common/ActionButton";
import SelectField from "../../components/common/SelectField";
import InputField from "../../components/common/InputField";

const AttendanceManagement = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState({
    totalAttendance: 0,
    checkedIn: 0,
    checkedOut: 0,
    uniqueMembers: 0,
    dayOfWeekCounts: [0, 0, 0, 0, 0, 0, 0],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0], // One week ago
    endDate: new Date().toISOString().split("T")[0], // Today
    status: "",
    memberId: "",
  });

  const navigate = useNavigate();

  // Fetch attendance records based on filters
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);

        // Convert string dates to Date objects
        const startDate = filters.startDate
          ? new Date(filters.startDate)
          : undefined;
        const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

        // Make sure endDate is end of day
        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
        }

        // Prepare filters
        const queryFilters = {
          startDate,
          endDate,
          status: filters.status || undefined,
          memberId: filters.memberId || undefined,
        };

        // Fetch attendance records
        const records = await getAllAttendanceRecords(queryFilters);
        setAttendanceRecords(records);

        // Fetch statistics for the same date range
        const statsData = await getAttendanceStats(startDate, endDate);
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setError("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: new Date(new Date().setDate(new Date().getDate() - 7))
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      status: "",
      memberId: "",
    });
  };

  const handleCheckOut = (attendanceId) => {
    navigate(`/admin/attendance/${attendanceId}/checkout`);
  };

  const handleViewDetails = (attendanceId) => {
    navigate(`/admin/attendance/${attendanceId}`);
  };

  // Column definitions for DataTable
  const columns = [
    {
      title: "Date",
      field: "checkInTime",
      render: (row) => new Date(row.checkInTime).toLocaleDateString(),
    },
    {
      title: "Member",
      field: "memberName",
      render: (row) => (
        <span
          className="text-green-600 cursor-pointer hover:underline"
          onClick={() => navigate(`/admin/members/${row.memberId}`)}
        >
          {row.memberName}
        </span>
      ),
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
    {
      title: "Actions",
      field: "actions",
      render: (row) => (
        <div className="flex space-x-2">
          {row.status === AttendanceStatus.CHECKED_IN && (
            <ActionButton
              size="sm"
              color="red"
              onClick={() => handleCheckOut(row.id)}
            >
              Check Out
            </ActionButton>
          )}
          <ActionButton
            size="sm"
            color="blue"
            onClick={() => handleViewDetails(row.id)}
          >
            Details
          </ActionButton>
        </div>
      ),
    },
  ];

  const getDayName = (index) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[index];
  };

  // Build day of week data for display
  const dayOfWeekData = stats.dayOfWeekCounts.map((count, index) => ({
    day: getDayName(index),
    count,
    percentage:
      stats.totalAttendance > 0
        ? Math.round((count / stats.totalAttendance) * 100)
        : 0,
  }));

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader
          title="Attendance Management"
          children={
            <ActionButton
              onClick={() => navigate("/admin/attendance/checkin")}
              color="green"
              icon={
                <svg
                  className="w-5 h-5"
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
              New Check-In
            </ActionButton>
          }
        />

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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Attendance"
            value={stats.totalAttendance}
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
            color="green"
          />

          <StatsCard
            title="Currently Checked In"
            value={stats.checkedIn}
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
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            }
            color="blue"
          />

          <StatsCard
            title="Checked Out"
            value={stats.checkedOut}
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            }
            color="purple"
          />

          <StatsCard
            title="Unique Members"
            value={stats.uniqueMembers}
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
            color="yellow"
          />
        </div>

        {/* Filters */}
        <ContentCard title="Filters" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <SelectField
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              options={[
                { value: "", label: "All Statuses" },
                { value: AttendanceStatus.CHECKED_IN, label: "Checked In" },
                { value: AttendanceStatus.CHECKED_OUT, label: "Checked Out" },
              ]}
            />

            <InputField
              label="Member ID (Optional)"
              name="memberId"
              value={filters.memberId}
              onChange={handleFilterChange}
              placeholder="Filter by member ID"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <ActionButton onClick={clearFilters} color="gray" size="sm">
              Clear Filters
            </ActionButton>
          </div>
        </ContentCard>

        {/* Attendance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Day of Week Chart */}
          <ContentCard title="Attendance by Day of Week">
            <div className="space-y-4">
              {dayOfWeekData.map((day) => (
                <div key={day.day}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {day.day}
                    </span>
                    <span className="text-sm text-gray-500">
                      {day.count} visits ({day.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${day.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </ContentCard>

          {/* Time Periods */}
          <ContentCard title="Date Range Information">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {formatDate(new Date(filters.startDate))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">
                    {formatDate(new Date(filters.endDate))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Days</p>
                  <p className="font-medium">
                    {Math.ceil(
                      (new Date(filters.endDate) -
                        new Date(filters.startDate)) /
                        (1000 * 60 * 60 * 24),
                    ) + 1}{" "}
                    days
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Daily Visits</p>
                  <p className="font-medium">
                    {stats.totalAttendance > 0
                      ? (
                          stats.totalAttendance /
                          (Math.ceil(
                            (new Date(filters.endDate) -
                              new Date(filters.startDate)) /
                              (1000 * 60 * 60 * 24),
                          ) +
                            1)
                        ).toFixed(1)
                      : 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Attendance Overview
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{
                    width: `${stats.totalAttendance > 0 ? (stats.checkedIn / stats.totalAttendance) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Checked In: {stats.checkedIn}</span>
                <span>Checked Out: {stats.checkedOut}</span>
                <span>Total: {stats.totalAttendance}</span>
              </div>
            </div>
          </ContentCard>
        </div>

        {/* Attendance Records Table */}
        <ContentCard
          title="Attendance Records"
          noPadding
          footer={
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Showing {attendanceRecords.length} records
              </span>
              <ActionButton
                onClick={() => navigate("/admin/attendance/export")}
                color="blue"
                size="sm"
              >
                Export Data
              </ActionButton>
            </div>
          }
        >
          <DataTable
            columns={columns}
            data={attendanceRecords}
            isLoading={loading}
            emptyMessage="No attendance records found for the selected filters."
          />
        </ContentCard>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceManagement;
