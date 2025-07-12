export const AttendanceStatus = {
  CHECKED_IN: "checked-in",
  CHECKED_OUT: "checked-out",
  NO_SHOW: "no-show",
};

export const CheckInMethod = {
  FRONT_DESK: "front-desk",
  SELF_SERVICE: "self-service",
  ADMIN: "admin",
  COACH: "coach",
};

export const AttendanceType = {
  REGULAR: "regular",
  COACHING: "coaching",
  EVENT: "event",
  COMPETITION: "competition",
};

/**
 * Calculate if a member can check in based on their membership
 * @param {Object} memberProfile - The member profile document
 * @returns {Object} - Validation result with status and message
 */
export const validateCheckIn = (memberProfile) => {
  const now = new Date();

  if (memberProfile.membershipStatus !== "active") {
    return {
      valid: false,
      message: "Your membership is not active. Please renew to check in.",
    };
  }

  if (
    memberProfile.membershipExpiration &&
    new Date(memberProfile.membershipExpiration.toDate()) < now
  ) {
    return {
      valid: false,
      message: "Your membership has expired. Please renew to check in.",
    };
  }

  const membershipType = memberProfile.membershipType;
  if (!membershipType) {
    return {
      valid: false,
      message: "No membership type found. Please contact the administrator.",
    };
  }

  const daysPerWeek = getMembershipDaysPerWeek(membershipType);
  if (memberProfile.daysUsedThisWeek >= daysPerWeek) {
    return {
      valid: false,
      message: `You've used all ${daysPerWeek} days allowed this week. Weekly limit resets on ${formatDate(
        memberProfile.weeklyResetDate
      )}.`,
    };
  }

  return {
    valid: true,
    message: "Check-in valid. Enjoy your session!",
  };
};

/**
 * Get days per week allowed for a membership type
 * @param {string} membershipTypeId - The membership type ID
 * @returns {number} - Days per week allowed
 */
export const getMembershipDaysPerWeek = (membershipTypeId) => {
  const daysMap = {
    "one-day-weekly": 1,
    "two-days-weekly": 2,
    "three-days-weekly": 3,
    unlimited: 7,
  };

  return daysMap[membershipTypeId] || 0;
};

/**
 * Format a date object as a readable string
 * @param {Date|Timestamp} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return "N/A";

  const dateObj = date.toDate ? date.toDate() : new Date(date);

  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format a time string (HH:MM)
 * @param {Date|Timestamp|string} time - The time to format
 * @returns {string} - Formatted time string
 */
export const formatTime = (time) => {
  if (!time) return "N/A";

  let timeObj;

  if (typeof time === "string") {
    if (time.includes(":")) return time;
    timeObj = new Date(time);
  } else {
    timeObj = time.toDate ? time.toDate() : new Date(time);
  }

  return timeObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Calculate duration between check-in and check-out times
 * @param {Date|Timestamp} checkInTime - Check-in time
 * @param {Date|Timestamp} checkOutTime - Check-out time
 * @returns {string} - Formatted duration
 */
export const calculateDuration = (checkInTime, checkOutTime) => {
  if (!checkInTime || !checkOutTime) return "N/A";

  const startTime = checkInTime.toDate
    ? checkInTime.toDate()
    : new Date(checkInTime);
  const endTime = checkOutTime.toDate
    ? checkOutTime.toDate()
    : new Date(checkOutTime);

  const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) {
    return `${minutes} minutes`;
  } else if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${
      minutes !== 1 ? "s" : ""
    }`;
  }
};
