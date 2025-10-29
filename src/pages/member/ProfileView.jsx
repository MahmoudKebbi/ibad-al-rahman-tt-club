import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/layout/PageHeader";
import ContentCard from "../../components/layout/ContentCard";
import ActionButton from "../../components/common/ActionButton";
import StatusBadge from "../../components/common/StatusBadge";
import { getUserById } from "../../services/firebase/users";

const ProfileView = () => {
  const { user } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [membershipData, setMembershipData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(false);

        const userData = getUserById(user?.uid);

        // TODO: GET MEMBERSHIP DATA FROM FIRESTORE SERVICE
        setProfileData({
          firstName: "Mahmoud",
          lastName: "Kebbi",
          displayName: "Mahmoud Kebbi",
          email: "mahmoud@example.com",
          phoneNumber: "+201234567890",
          birthDate: "1985-06-15",
          gender: "male",
          address: "123 Main St",
          city: "Cairo",
          playingLevel: "intermediate",
          createdAt: new Date("2023-12-01"),
          emergencyContact: {
            name: "Ahmed Kebbi",
            phone: "+201234567891",
          },
        });

        setMembershipData({
          membershipType: "annual",
          startDate: new Date("2024-01-01"),
          expiryDate: new Date("2025-01-01"),
          status: "active",
          amount: 480,
          paymentMethod: "credit_card",
          lastPayment: new Date("2024-01-01"),
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchProfileData();
    }
  }, [user?.uid]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  // Map gender value to display text
  const getGenderDisplay = (gender) => {
    const genderMap = {
      male: "Male",
      female: "Female",
      other: "Other",
      prefer_not_to_say: "Prefer not to say",
    };
    return genderMap[gender] || gender;
  };

  // Map membership type to display text
  const getMembershipTypeDisplay = (type) => {
    const typeMap = {
      monthly: "Monthly",
      quarterly: "Quarterly",
      annual: "Annual",
    };
    return typeMap[type] || type;
  };

  // Map playing level to display text
  const getPlayingLevelDisplay = (level) => {
    const levelMap = {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      competitive: "Competitive",
    };
    return levelMap[level] || level;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4">
          <PageHeader title="My Profile" />
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader title="My Profile">
          <div className="flex space-x-2">
            <Link to="/member/profile/edit">
              <ActionButton
                color="blue"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                }
              >
                Edit Profile
              </ActionButton>
            </Link>
            <Link to="/member/profile/password">
              <ActionButton
                color="gray"
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
              >
                Change Password
              </ActionButton>
            </Link>
          </div>
        </PageHeader>

        {/* Profile Overview Card */}
        <ContentCard>
          <div className="flex flex-col md:flex-row">
            {/* Profile Photo */}
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                  {profileData?.photoURL ? (
                    <img
                      src={profileData.photoURL}
                      alt={profileData.displayName}
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-medium text-gray-600">
                      {profileData?.firstName?.charAt(0) || "?"}
                    </span>
                  )}
                </div>
                <Link
                  to="/member/profile/photo"
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                >
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">
                {profileData?.displayName}
              </h2>
              <p className="text-gray-600">{profileData?.email}</p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Member Since
                  </h3>
                  <p className="text-gray-800">
                    {formatDate(profileData?.createdAt)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Playing Level
                  </h3>
                  <p className="text-gray-800">
                    {getPlayingLevelDisplay(profileData?.playingLevel)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ContentCard>

        {/* Membership Information */}
        <ContentCard title="Membership Information" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Membership Type
              </h3>
              <p className="text-gray-800">
                {getMembershipTypeDisplay(membershipData?.membershipType)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <div className="mt-1">
                <StatusBadge
                  status={
                    membershipData?.status === "active" ? "success" : "error"
                  }
                  text={
                    membershipData?.status === "active" ? "Active" : "Inactive"
                  }
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Valid Until</h3>
              <p className="text-gray-800">
                {formatDate(membershipData?.expiryDate)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Last Payment
              </h3>
              <p className="text-gray-800">
                {formatDate(membershipData?.lastPayment)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount</h3>
              <p className="text-gray-800">${membershipData?.amount}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Payment Method
              </h3>
              <p className="text-gray-800">
                {membershipData?.paymentMethod === "credit_card"
                  ? "Credit Card"
                  : membershipData?.paymentMethod}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Payment History
            </h3>
            <p className="text-gray-500">
              View your complete payment history on the{" "}
              <Link
                to="/member/payments"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Payments page
              </Link>
              .
            </p>
          </div>
        </ContentCard>

        {/* Personal Information */}
        <ContentCard title="Personal Information" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">First Name</h3>
              <p className="text-gray-800">{profileData?.firstName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
              <p className="text-gray-800">{profileData?.lastName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Phone Number
              </h3>
              <p className="text-gray-800">
                {profileData?.phoneNumber || "Not provided"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Birth Date</h3>
              <p className="text-gray-800">
                {formatDate(profileData?.birthDate) || "Not provided"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Gender</h3>
              <p className="text-gray-800">
                {getGenderDisplay(profileData?.gender) || "Not provided"}
              </p>
            </div>
          </div>
        </ContentCard>

        {/* Address Information */}
        <ContentCard title="Address Information" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="text-gray-800">
                {profileData?.address || "Not provided"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">City</h3>
              <p className="text-gray-800">
                {profileData?.city || "Not provided"}
              </p>
            </div>
          </div>
        </ContentCard>

        {/* Emergency Contact */}
        <ContentCard title="Emergency Contact" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Contact Name
              </h3>
              <p className="text-gray-800">
                {profileData?.emergencyContact?.name || "Not provided"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Contact Phone
              </h3>
              <p className="text-gray-800">
                {profileData?.emergencyContact?.phone || "Not provided"}
              </p>
            </div>
          </div>
        </ContentCard>
      </div>
    </DashboardLayout>
  );
};

export default ProfileView;
