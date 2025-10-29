import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  doc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import {
  AttendanceStatus,
  CheckInMethod,
  validateCheckIn,
} from "../../models/Attendance";

/**
 * Check in a member
 * @param {string} memberId - The member's user ID
 * @param {Object} checkInData - Check-in data
 * @returns {Promise<Object>} - The created attendance record
 */
export const checkInMember = async (memberId, checkInData = {}) => {
  try {
    // Get member profile
    const memberProfileRef = doc(db, "memberProfiles", memberId);
    const memberProfileSnap = await getDoc(memberProfileRef);

    if (!memberProfileSnap.exists()) {
      throw new Error("Member profile not found");
    }

    const memberProfile = memberProfileSnap.data();

    // Validate check-in eligibility
    const validationResult = validateCheckIn(memberProfile);
    if (!validationResult.valid) {
      throw new Error(validationResult.message);
    }

    // Create attendance record
    const now = new Date();
    const attendanceData = {
      memberId,
      memberName:
        checkInData.memberName || memberProfile.displayName || "Unknown",
      checkInTime: checkInData.checkInTime || now,
      checkInMethod: checkInData.checkInMethod || CheckInMethod.FRONT_DESK,
      status: AttendanceStatus.CHECKED_IN,
      notes: checkInData.notes || "",
      attendanceType: checkInData.attendanceType || "regular",
      checkedInBy: checkInData.checkedInBy || {
        uid: checkInData.adminId || "system",
        name: checkInData.adminName || "System",
        timestamp: serverTimestamp(),
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Add to attendance collection
    const attendanceRef = await addDoc(
      collection(db, "attendance"),
      attendanceData,
    );

    // Update member profile
    await updateDoc(memberProfileRef, {
      lastVisit: now,
      daysUsedThisWeek: memberProfile.daysUsedThisWeek + 1,
      daysUsedThisMonth: memberProfile.daysUsedThisMonth + 1,
      currentAttendanceId: attendanceRef.id,
      updatedAt: serverTimestamp(),
    });

    return {
      id: attendanceRef.id,
      ...attendanceData,
    };
  } catch (error) {
    console.error("Error checking in member:", error);
    throw error;
  }
};

/**
 * Check out a member
 * @param {string} attendanceId - The attendance record ID
 * @param {Object} checkOutData - Check-out data
 * @returns {Promise<Object>} - The updated attendance record
 */
export const checkOutMember = async (attendanceId, checkOutData = {}) => {
  try {
    // Get attendance record
    const attendanceRef = doc(db, "attendance", attendanceId);
    const attendanceSnap = await getDoc(attendanceRef);

    if (!attendanceSnap.exists()) {
      throw new Error("Attendance record not found");
    }

    const attendanceData = attendanceSnap.data();

    // If already checked out, return existing record
    if (attendanceData.status === AttendanceStatus.CHECKED_OUT) {
      return {
        id: attendanceId,
        ...attendanceData,
      };
    }

    // Update attendance record
    const now = new Date();
    const updatedData = {
      checkOutTime: checkOutData.checkOutTime || now,
      status: AttendanceStatus.CHECKED_OUT,
      duration:
        checkOutData.duration ||
        (now - attendanceData.checkInTime.toDate()) / (1000 * 60), // Duration in minutes
      notes: checkOutData.notes
        ? `${attendanceData.notes} | ${checkOutData.notes}`
        : attendanceData.notes,
      checkedOutBy: checkOutData.checkedOutBy || {
        uid: checkOutData.adminId || "system",
        name: checkOutData.adminName || "System",
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    };

    await updateDoc(attendanceRef, updatedData);

    // Update member profile to clear current attendance
    const memberProfileRef = doc(db, "memberProfiles", attendanceData.memberId);
    await updateDoc(memberProfileRef, {
      currentAttendanceId: null,
      updatedAt: serverTimestamp(),
    });

    return {
      id: attendanceId,
      ...attendanceData,
      ...updatedData,
    };
  } catch (error) {
    console.error("Error checking out member:", error);
    throw error;
  }
};

/**
 * Get all attendance records for admin
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - List of attendance records
 */
export const getAllAttendanceRecords = async (filters = {}) => {
  try {
    let attendanceQuery = query(
      collection(db, "attendance"),
      orderBy("checkInTime", "desc"),
    );

    // Apply date range filter
    if (filters.startDate && filters.endDate) {
      attendanceQuery = query(
        attendanceQuery,
        where("checkInTime", ">=", filters.startDate),
        where("checkInTime", "<=", filters.endDate),
      );
    }

    // Apply member filter
    if (filters.memberId) {
      attendanceQuery = query(
        attendanceQuery,
        where("memberId", "==", filters.memberId),
      );
    }

    // Apply status filter
    if (filters.status) {
      attendanceQuery = query(
        attendanceQuery,
        where("status", "==", filters.status),
      );
    }

    // Apply limit
    if (filters.limit) {
      attendanceQuery = query(attendanceQuery, limit(filters.limit));
    }

    const querySnapshot = await getDocs(attendanceQuery);

    const attendanceRecords = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      checkInTime:
        doc.data().checkInTime instanceof Timestamp
          ? doc.data().checkInTime.toDate()
          : doc.data().checkInTime,
      checkOutTime:
        doc.data().checkOutTime instanceof Timestamp
          ? doc.data().checkOutTime.toDate()
          : doc.data().checkOutTime,
      createdAt:
        doc.data().createdAt instanceof Timestamp
          ? doc.data().createdAt.toDate()
          : doc.data().createdAt,
    }));

    return attendanceRecords;
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    throw error;
  }
};

/**
 * Get member's attendance records
 * @param {string} memberId - The member's user ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - List of attendance records
 */
export const getMemberAttendanceRecords = async (memberId, filters = {}) => {
  try {
    let attendanceQuery = query(
      collection(db, "attendance"),
      where("memberId", "==", memberId),
      orderBy("checkInTime", "desc"),
    );

    // Apply date range filter
    if (filters.startDate && filters.endDate) {
      attendanceQuery = query(
        attendanceQuery,
        where("checkInTime", ">=", filters.startDate),
        where("checkInTime", "<=", filters.endDate),
      );
    }

    // Apply status filter
    if (filters.status) {
      attendanceQuery = query(
        attendanceQuery,
        where("status", "==", filters.status),
      );
    }

    // Apply limit
    if (filters.limit) {
      attendanceQuery = query(attendanceQuery, limit(filters.limit));
    }

    const querySnapshot = await getDocs(attendanceQuery);

    const attendanceRecords = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      checkInTime:
        doc.data().checkInTime instanceof Timestamp
          ? doc.data().checkInTime.toDate()
          : doc.data().checkInTime,
      checkOutTime:
        doc.data().checkOutTime instanceof Timestamp
          ? doc.data().checkOutTime.toDate()
          : doc.data().checkOutTime,
      createdAt:
        doc.data().createdAt instanceof Timestamp
          ? doc.data().createdAt.toDate()
          : doc.data().createdAt,
    }));

    return attendanceRecords;
  } catch (error) {
    console.error("Error fetching member attendance records:", error);
    throw error;
  }
};

/**
 * Check if a member is currently checked in
 * @param {string} memberId - The member's user ID
 * @returns {Promise<Object|null>} - Current attendance record or null
 */
export const getCurrentAttendance = async (memberId) => {
  try {
    // Get member profile
    const memberProfileRef = doc(db, "memberProfiles", memberId);
    const memberProfileSnap = await getDoc(memberProfileRef);

    if (!memberProfileSnap.exists()) {
      return null;
    }

    const memberProfile = memberProfileSnap.data();

    // Check if member has a current attendance record
    if (!memberProfile.currentAttendanceId) {
      return null;
    }

    // Get the attendance record
    const attendanceRef = doc(
      db,
      "attendance",
      memberProfile.currentAttendanceId,
    );
    const attendanceSnap = await getDoc(attendanceRef);

    if (!attendanceSnap.exists()) {
      // Clean up stale reference
      await updateDoc(memberProfileRef, {
        currentAttendanceId: null,
        updatedAt: serverTimestamp(),
      });
      return null;
    }

    const attendanceData = attendanceSnap.data();

    return {
      id: attendanceSnap.id,
      ...attendanceData,
      checkInTime:
        attendanceData.checkInTime instanceof Timestamp
          ? attendanceData.checkInTime.toDate()
          : attendanceData.checkInTime,
      checkOutTime:
        attendanceData.checkOutTime instanceof Timestamp
          ? attendanceData.checkOutTime.toDate()
          : attendanceData.checkOutTime,
    };
  } catch (error) {
    console.error("Error getting current attendance:", error);
    throw error;
  }
};

/**
 * Get attendance statistics for a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} - Attendance statistics
 */
export const getAttendanceStats = async (
  startDate = new Date(0),
  endDate = new Date(),
) => {
  try {
    const attendanceQuery = query(
      collection(db, "attendance"),
      where("checkInTime", ">=", startDate),
      where("checkInTime", "<=", endDate),
    );

    const querySnapshot = await getDocs(attendanceQuery);

    const records = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate statistics
    const totalAttendance = records.length;
    const checkedIn = records.filter(
      (r) => r.status === AttendanceStatus.CHECKED_IN,
    ).length;
    const checkedOut = records.filter(
      (r) => r.status === AttendanceStatus.CHECKED_OUT,
    ).length;
    const noShows = records.filter(
      (r) => r.status === AttendanceStatus.NO_SHOW,
    ).length;

    // Count unique members
    const uniqueMembers = new Set(records.map((r) => r.memberId)).size;

    // Attendance by day of week
    const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, ..., Sat
    records.forEach((record) => {
      const date =
        record.checkInTime instanceof Timestamp
          ? record.checkInTime.toDate()
          : new Date(record.checkInTime);
      const dayOfWeek = date.getDay();
      dayOfWeekCounts[dayOfWeek]++;
    });

    return {
      totalAttendance,
      checkedIn,
      checkedOut,
      noShows,
      uniqueMembers,
      dayOfWeekCounts,
    };
  } catch (error) {
    console.error("Error getting attendance statistics:", error);
    throw error;
  }
};
