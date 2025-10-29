import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPayments } from "../../services/firebase/payments";
import {
  formatCurrency,
  getMembershipStatus,
  getPaymentMethodLabel,
} from "../../models/Payment";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/layout/PageHeader";
import ContentCard from "../../components/layout/ContentCard";
import DataTable from "../../components/common/DataTable";
import SelectField from "../../components/common/SelectField";
import ActionButton from "../../components/common/ActionButton";
import StatsCard from "../../components/dashboard/StatsCard";

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'active', 'expired'
  const [timeRange, setTimeRange] = useState("all"); // 'all', 'month', 'quarter', 'year'

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);

        // Get all payments from Firebase
        const paymentsData = await getAllPayments();

        // Apply time range filter
        let filteredPayments = paymentsData;

        if (timeRange !== "all") {
          const now = new Date();
          let cutoffDate = new Date();

          if (timeRange === "month") {
            cutoffDate.setMonth(now.getMonth() - 1);
          } else if (timeRange === "quarter") {
            cutoffDate.setMonth(now.getMonth() - 3);
          } else if (timeRange === "year") {
            cutoffDate.setFullYear(now.getFullYear() - 1);
          }

          filteredPayments = filteredPayments.filter(
            (payment) => payment.paymentDate >= cutoffDate,
          );
        }

        // Apply membership status filter
        if (filter !== "all") {
          const now = new Date();

          if (filter === "active") {
            filteredPayments = filteredPayments.filter(
              (payment) =>
                payment.expirationDate && payment.expirationDate > now,
            );
          } else if (filter === "expired") {
            filteredPayments = filteredPayments.filter(
              (payment) =>
                payment.expirationDate && payment.expirationDate <= now,
            );
          }
        }

        setPayments(filteredPayments);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [filter, timeRange]);

  const calculateTotalRevenue = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  // Column definitions for DataTable
  const columns = [
    {
      title: "Date",
      field: "paymentDate",
      render: (row) => row.paymentDate.toLocaleDateString(),
    },
    {
      title: "Member",
      field: "memberName",
      render: (row) => (
        <span
          className="text-green-600 cursor-pointer hover:underline"
          onClick={() => navigate(`/admin/members/${row.memberId}`)}
        >
          {row.memberName || row.memberId}
        </span>
      ),
    },
    {
      title: "Membership",
      field: "membershipName",
    },
    {
      title: "Amount",
      field: "amount",
      render: (row) => formatCurrency(row.amount),
    },
    {
      title: "Valid Until",
      field: "expirationDate",
      render: (row) =>
        row.expirationDate ? row.expirationDate.toLocaleDateString() : "N/A",
    },
    {
      title: "Method",
      field: "paymentMethod",
      render: (row) => getPaymentMethodLabel(row.paymentMethod),
    },
    {
      title: "Status",
      field: "status",
      render: (row) => {
        const status = row.expirationDate
          ? getMembershipStatus(row.expirationDate)
          : "unknown";
        return (
          <span
            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      title: "Actions",
      field: "actions",
      render: (row) => (
        <div className="flex space-x-2">
          <ActionButton
            size="sm"
            color="blue"
            onClick={() => navigate(`/admin/payments/${row.id}/receipt`)}
          >
            Receipt
          </ActionButton>
          <ActionButton
            size="sm"
            color="green"
            onClick={() => navigate(`/admin/members/${row.memberId}`)}
          >
            View Member
          </ActionButton>
        </div>
      ),
    },
  ];

  // Filter options
  const timeRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "month", label: "Last Month" },
    { value: "quarter", label: "Last 3 Months" },
    { value: "year", label: "Last Year" },
  ];

  const statusFilterOptions = [
    { value: "all", label: "All Memberships" },
    { value: "active", label: "Active Memberships" },
    { value: "expired", label: "Expired Memberships" },
  ];

  // Current date and time
  const currentDateTime = new Date()
    .toISOString()
    .replace("T", " ")
    .substring(0, 19);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader
          title="Payment Management"
          children={
            <ActionButton
              onClick={() => navigate("/admin/members")}
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              }
            >
              Record New Payment
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(calculateTotalRevenue())}
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="green"
          />

          <StatsCard
            title="Total Payments"
            value={payments.length}
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
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
            }
            color="blue"
          />

          <StatsCard
            title="Active Memberships"
            value={
              payments.filter(
                (p) =>
                  p.expirationDate &&
                  getMembershipStatus(p.expirationDate) === "active",
              ).length
            }
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
            color="purple"
          />
        </div>

        <ContentCard
          title="Payment Records"
          headerActions={
            <div className="flex space-x-2">
              <SelectField
                name="timeRange"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                options={timeRangeOptions}
                className="mb-0 w-40"
              />

              <SelectField
                name="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                options={statusFilterOptions}
                className="mb-0 w-48"
              />
            </div>
          }
        >
          <DataTable
            columns={columns}
            data={payments}
            isLoading={loading && !error}
            emptyMessage="No payments found matching the selected filters."
          />
        </ContentCard>
      </div>
    </DashboardLayout>
  );
};

export default PaymentManagement;
