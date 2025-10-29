import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase/config";
import {
  checkInMember,
  getCurrentAttendance,
} from "../../services/firebase/attendance";
import { AttendanceType, CheckInMethod } from "../../models/Attendance";

import ContentCard from "../layout/ContentCard";
import InputField from "../../components/common/InputField";
import SelectField from "../../components/common/SelectField";
import ActionButton from "../common/ActionButton";

const CheckInForm = ({ memberId, onSuccess, onCancel }) => {
  const [member, setMember] = useState(null);
  const [memberProfile, setMemberProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    attendanceType: AttendanceType.REGULAR,
    notes: "",
  });
  const [currentAttendance, setCurrentAttendance] = useState(null);

  // Fetch member data and current attendance
  useEffect(() => {
    const fetchMemberData = async () => {
      if (!memberId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user document
        const memberDoc = await getDoc(doc(db, "users", memberId));
        if (!memberDoc.exists()) {
          setError("Member not found");
          setLoading(false);
          return;
        }

        const memberData = {
          id: memberDoc.id,
          ...memberDoc.data(),
        };
        setMember(memberData);

        // Fetch member profile
        const profileDoc = await getDoc(doc(db, "memberProfiles", memberId));
        if (!profileDoc.exists()) {
          setError("Member profile not found");
          setLoading(false);
          return;
        }

        const profileData = profileDoc.data();
        setMemberProfile({
          ...profileData,
          lastVisit: profileData.lastVisit?.toDate?.() || profileData.lastVisit,
          weeklyResetDate:
            profileData.weeklyResetDate?.toDate?.() ||
            profileData.weeklyResetDate,
          monthlyResetDate:
            profileData.monthlyResetDate?.toDate?.() ||
            profileData.monthlyResetDate,
        });

        // Check if already checked in
        const attendance = await getCurrentAttendance(memberId);
        setCurrentAttendance(attendance);
      } catch (err) {
        console.error("Error fetching member data:", err);
        setError(`Failed to load member data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [memberId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!memberId) {
      setError("Member ID is required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Prepare check-in data
      const checkInData = {
        memberName: member.displayName,
        attendanceType: formData.attendanceType,
        notes: formData.notes,
        checkInMethod: CheckInMethod.ADMIN,
        adminId: "MahmoudKebbi", // Current admin ID
        adminName: "MahmoudKebbi", // Current admin name
      };

      // Perform check-in
      const result = await checkInMember(memberId, checkInData);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error("Error checking in member:", err);
      setError(`Check-in failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If member is already checked in
  if (currentAttendance) {
    return (
      <ContentCard title="Member Already Checked In">
        <div className="bg-yellow-50 p-4 rounded-md mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
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
              <h3 className="text-sm font-medium text-yellow-800">
                {member.displayName} is already checked in
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Checked in at:{" "}
                  {currentAttendance.checkInTime.toLocaleTimeString()}
                </p>
                <p>
                  Date: {currentAttendance.checkInTime.toLocaleDateString()}
                </p>
                {currentAttendance.notes && (
                  <p>Notes: {currentAttendance.notes}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <ActionButton onClick={onCancel} color="gray">
            Cancel
          </ActionButton>
          <ActionButton
            onClick={() => onSuccess(currentAttendance)}
            color="blue"
          >
            View Attendance
          </ActionButton>
        </div>
      </ContentCard>
    );
  }

  return (
    <ContentCard title="Check In Member">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
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

      {member && memberProfile && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Member Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{member.displayName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{member.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Membership Type</p>
              <p className="font-medium">
                {memberProfile.membershipType || "None"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Membership Status</p>
              <p className="font-medium">
                {memberProfile.membershipStatus || "Inactive"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Weekly Usage</p>
              <p className="font-medium">
                {memberProfile.daysUsedThisWeek} days used this week
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Visit</p>
              <p className="font-medium">
                {memberProfile.lastVisit
                  ? new Date(memberProfile.lastVisit).toLocaleDateString()
                  : "Never"}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <SelectField
            label="Attendance Type"
            name="attendanceType"
            value={formData.attendanceType}
            onChange={handleChange}
            options={[
              { value: AttendanceType.REGULAR, label: "Regular Training" },
              { value: AttendanceType.COACHING, label: "Coaching Session" },
              { value: AttendanceType.EVENT, label: "Special Event" },
              { value: AttendanceType.COMPETITION, label: "Competition" },
            ]}
          />
        </div>

        <div className="mb-6">
          <InputField
            label="Notes (Optional)"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any comments about this check-in"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <ActionButton type="button" onClick={onCancel} color="gray">
            Cancel
          </ActionButton>
          <ActionButton type="submit" disabled={submitting} color="green">
            {submitting ? "Checking In..." : "Check In Member"}
          </ActionButton>
        </div>
      </form>
    </ContentCard>
  );
};

export default CheckInForm;
