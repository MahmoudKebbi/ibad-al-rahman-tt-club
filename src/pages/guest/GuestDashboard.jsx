import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/layout/PageHeader";
import ContentCard from "../../components/layout/ContentCard";
import ActionButton from "../../components/common/ActionButton";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const GuestDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // Club schedule for display
  const clubSchedule = [
    { day: "Monday", hours: "18:00 - 21:00", level: "All Levels" },
    {
      day: "Wednesday",
      hours: "18:00 - 21:00",
      level: "Beginners & Intermediate",
    },
    { day: "Friday", hours: "17:00 - 20:00", level: "Advanced" },
    { day: "Saturday", hours: "10:00 - 14:00", level: "All Levels" },
  ];

  // Club benefits for display
  const clubBenefits = [
    {
      icon: (
        <svg
          className="h-8 w-8 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Professional Coaching",
      description:
        "Access to certified coaches with years of experience in table tennis.",
    },
    {
      icon: (
        <svg
          className="h-8 w-8 text-green-500"
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
      ),
      title: "Community",
      description:
        "Join a vibrant community of table tennis enthusiasts of all levels.",
    },
    {
      icon: (
        <svg
          className="h-8 w-8 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Modern Facilities",
      description:
        "Practice in our well-maintained facility with professional equipment.",
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader title={`Welcome, ${user?.displayName || "Guest"}`} />

        <div className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome to Ibad Al Rahman Table Tennis Club!
          </h2>
          <p className="text-lg mb-4">Thank you for joining us as a guest.</p>
          <p>
            As a guest, you can view the club schedule and explore membership
            options. Consider becoming a member to enjoy all club benefits!
          </p>
          <Link to="/guest/register">
            <ActionButton color="black" className="mt-4 bg-tt-black-dark">
              Become a Member
            </ActionButton>
          </Link>
        </div>

        {/* Two-column layout for schedule and benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Club Schedule */}
          <ContentCard title="Club Schedule" noPadding={false}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clubSchedule.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.day}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {item.hours}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {item.level}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              * Schedule may change during holidays or special events. Check
              with the club for the most up-to-date information.
            </p>
          </ContentCard>

          {/* Membership Benefits */}
          <ContentCard title="Membership Benefits" noPadding={false}>
            <div className="space-y-6">
              {clubBenefits.map((benefit, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0">{benefit.icon}</div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      {benefit.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-900">
                Membership Fees
              </h4>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Monthly:</span> $50
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Quarterly:</span> $135 (Save
                  $15)
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Annual:</span> $480 (Save $120)
                </p>
              </div>
            </div>
          </ContentCard>
        </div>

        {/* Call to Action */}
        <ContentCard noPadding={false}>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Ready to Join?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Take the next step in your table tennis journey and become a
              member today. Fill out the registration form to get started.
            </p>
            <Link to="/guest/register">
              <ActionButton
                color="green"
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
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                }
              >
                Register as Member
              </ActionButton>
            </Link>
          </div>
        </ContentCard>
      </div>
    </DashboardLayout>
  );
};

export default GuestDashboard;
