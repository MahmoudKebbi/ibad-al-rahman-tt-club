import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getMemberPayments,
  getMemberProfile,
} from "../../services/firebase/payments";
import {
  formatCurrency,
  getMembershipStatus,
  getPaymentMethodLabel,
  getMembershipById,
  getMembershipDaysRemaining,
} from "../../models/Payment";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/layout/PageHeader";
import ContentCard from "../../components/layout/ContentCard";
import DataTable from "../../components/common/DataTable";
import ActionButton from "../../components/common/ActionButton";
import StatusBadge from "../../components/common/StatusBadge";

const MemberPayments = () => {
  const [payments, setPayments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Fetch member profile and payment data
  useEffect(() => {
    const fetchMemberData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);

        // Get profile and payments in parallel
        const [profileData, paymentsData] = await Promise.all([
          getMemberProfile(user.uid),
          getMemberPayments(user.uid),
        ]);

        setProfile(profileData);
        setPayments(paymentsData);
      } catch (err) {
        console.error("Error fetching member data:", err);
        setError("Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [user]);

  // Column definitions for DataTable
  const columns = [
    {
      title: "Date",
      field: "paymentDate",
      render: (row) => row.paymentDate.toLocaleDateString(),
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
          <StatusBadge status={status === "active" ? "paid" : "expired"} />
        );
      },
    },
    {
      title: "Receipt",
      field: "receipt",
      render: (row) => (
        <ActionButton
          size="sm"
          color="blue"
          onClick={() => navigate(`/payment/receipt/${row.id}`)}
        >
          View
        </ActionButton>
      ),
    },
  ];

  // Membership details info
  const membershipType = user?.membershipType || profile?.membershipType;
  const membershipExpiration =
    user?.membershipExpiration?.toDate?.() || user?.membershipExpiration;
  const membershipStatus = membershipExpiration
    ? getMembershipStatus(membershipExpiration)
    : "inactive";
  const membershipDetails = membershipType
    ? getMembershipById(membershipType)
    : null;
  const daysRemaining = membershipExpiration
    ? getMembershipDaysRemaining(membershipExpiration)
    : 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader title="Membership & Payments" />

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

        {/* Payment Status Card */}
        <ContentCard>
          <div className="flex items-center">
            <div
              className={`rounded-full p-3 ${
                membershipStatus === "active"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-800">
                Membership Payment Status
              </h3>
              <div className="mt-1 flex items-center">
                <StatusBadge
                  status={membershipStatus === "active" ? "paid" : "expired"}
                />
                <span className="ml-2">
                  {membershipStatus === "active" ? (
                    <span className="text-green-700">
                      Your membership is active. {daysRemaining} days remaining.
                    </span>
                  ) : (
                    <span className="text-red-700">
                      Your membership has expired. Please contact the
                      administrator to renew.
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </ContentCard>

        {profile && (
          <ContentCard title="Usage Statistics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Weekly Usage</h3>
                <div className="bg-gray-100 h-4 rounded-full mb-2">
                  <div
                    className="bg-green-500 h-4 rounded-full"
                    style={{
                      width: `${membershipDetails ? (profile.daysUsedThisWeek / membershipDetails.daysPerWeek) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {profile.daysUsedThisWeek} of{" "}
                    {membershipDetails?.daysPerWeek || 0} days used
                  </span>
                  <span className="text-gray-600">
                    Resets:{" "}
                    {profile.weeklyResetDate
                      ? new Date(profile.weeklyResetDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Monthly Usage</h3>
                <div className="bg-gray-100 h-4 rounded-full mb-2">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{
                      width: `${
                        membershipDetails &&
                        membershipDetails.daysPerWeek * 4 > 0
                          ? (profile.daysUsedThisMonth /
                              (membershipDetails.daysPerWeek * 4)) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {profile.daysUsedThisMonth} days used this month
                  </span>
                  <span className="text-gray-600">
                    Resets:{" "}
                    {profile.monthlyResetDate
                      ? new Date(profile.monthlyResetDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Membership Details</h3>
              {membershipDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{membershipDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Days Per Week</p>
                    <p className="font-medium">
                      {membershipDetails.daysPerWeek} days
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Coaching Included</p>
                    <p className="font-medium">
                      {membershipDetails.includesCoaching ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expiration</p>
                    <p className="font-medium">
                      {membershipExpiration
                        ? new Date(membershipExpiration).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  No active membership. Please contact the club administrator to
                  sign up.
                </p>
              )}
            </div>

            {profile.lastVisit && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Last Visit</p>
                <p className="font-medium">
                  {new Date(profile.lastVisit).toLocaleString()}
                </p>
              </div>
            )}
          </ContentCard>
        )}

        <ContentCard
          title="Payment History"
          className="mt-6"
          footer={
            <div className="text-sm text-gray-600">
              To renew your membership or for any payment-related inquiries,
              please contact the club administrator at{" "}
              <a
                href="tel:+96178761843"
                className="text-green-600 hover:underline"
              >
                +961 78 761843
              </a>
              .
            </div>
          }
          noPadding
        >
          <DataTable
            columns={columns}
            data={payments}
            isLoading={loading && !error}
            emptyMessage="You don't have any payment history yet."
          />
        </ContentCard>
      </div>
    </DashboardLayout>
  );
};

export default MemberPayments;
