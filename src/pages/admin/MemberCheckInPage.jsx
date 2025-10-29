import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "../../services/firebase/config";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/layout/PageHeader";
import ContentCard from "../../components/layout/ContentCard";
import DataTable from "../../components/common/DataTable";
import InputField from "../../components/common/InputField";
import ActionButton from "../../components/common/ActionButton";
import SelectField from "../../components/common/SelectField";
import QuickCheckInOut from "../../components/admin/QuickCheckInOut";
import CheckInForm from "../../components/admin/CheckInForm";

const MemberCheckInPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState(null);

  const navigate = useNavigate();

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);

        // Query for members
        let membersQuery = query(
          collection(db, "users"),
          where("role", "==", "member"),
          orderBy("displayName"),
        );

        const querySnapshot = await getDocs(membersQuery);

        // Get member data
        const membersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMembers(membersList);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to load members list");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Filter members based on search term and membership filter
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      !searchTerm ||
      member.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phoneNumber?.includes(searchTerm);

    const matchesMembership =
      membershipFilter === "all" ||
      member.membershipStatus === membershipFilter;

    return matchesSearch && matchesMembership;
  });

  const handleSelectMember = (member) => {
    setSelectedMember(member);
  };

  const handleCheckInSuccess = (attendanceData) => {
    navigate(`/admin/attendance/${attendanceData.id}`);
  };

  const handleCancel = () => {
    setSelectedMember(null);
  };

  // Column definitions for DataTable
  const columns = [
    {
      title: "Name",
      field: "displayName",
      render: (row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            {row.photoURL ? (
              <img
                src={row.photoURL}
                alt={row.displayName}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <span className="text-lg font-medium text-gray-600">
                {row.displayName?.charAt(0) || "?"}
              </span>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {row.displayName}
            </div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Membership",
      field: "membershipType",
      render: (row) => (
        <span className="text-sm text-gray-500">
          {row.membershipType || "None"}
        </span>
      ),
    },
    {
      title: "Status",
      field: "membershipStatus",
      render: (row) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.membershipStatus === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.membershipStatus || "Inactive"}
        </span>
      ),
    },
    {
      title: "Actions",
      field: "actions",
      render: (row) => (
        <ActionButton
          size="sm"
          color="green"
          onClick={() => handleSelectMember(row)}
        >
          Check In
        </ActionButton>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader
          title={selectedMember ? "Check In Member" : "Check In Management"}
          showBackButton={!!selectedMember}
          backButtonLabel="Back to Members"
          onBackClick={handleCancel}
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

        {selectedMember ? (
          // Check In Form for selected member
          <div className="max-w-3xl mx-auto">
            <CheckInForm
              memberId={selectedMember.id}
              onSuccess={handleCheckInSuccess}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          // Member selection UI
          <>
            {/* Quick Check-In/Out */}
            <div className="mb-6">
              <QuickCheckInOut />
            </div>

            {/* Member List */}
            <ContentCard
              title="Members"
              headerActions={
                <div className="flex space-x-2">
                  <InputField
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-0 w-64"
                  />
                  <SelectField
                    value={membershipFilter}
                    onChange={(e) => setMembershipFilter(e.target.value)}
                    options={[
                      { value: "all", label: "All Members" },
                      { value: "active", label: "Active Members" },
                      { value: "expired", label: "Expired Members" },
                    ]}
                    className="mb-0 w-48"
                  />
                </div>
              }
              noPadding
            >
              <DataTable
                columns={columns}
                data={filteredMembers}
                isLoading={loading}
                emptyMessage="No members found matching your criteria."
              />
            </ContentCard>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MemberCheckInPage;
