import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Get all sessions with optional filtering
 * @param {Object} filters - Optional filters (startDate, endDate, type, etc.)
 * @returns {Promise<Array>} - List of session objects
 */
export const getAllSessions = async (filters = {}) => {
  try {
    let sessionsQuery = query(
      collection(db, "sessions"),
      orderBy("date", "asc"),
    );

    if (filters.startDate) {
      const startTimestamp = Timestamp.fromDate(filters.startDate);
      sessionsQuery = query(sessionsQuery, where("date", ">=", startTimestamp));
    }

    if (filters.endDate) {
      const endTimestamp = Timestamp.fromDate(filters.endDate);
      sessionsQuery = query(sessionsQuery, where("date", "<=", endTimestamp));
    }

    if (filters.type) {
      sessionsQuery = query(sessionsQuery, where("type", "==", filters.type));
    }

    if (filters.coach) {
      sessionsQuery = query(sessionsQuery, where("coach", "==", filters.coach));
    }

    const snapshot = await getDocs(sessionsQuery);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.displayName,
        ...data,
        date: data.date?.toDate
          ? data.date.toDate().toISOString().split("T")[0]
          : data.date,
      };
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
};

/**
 * Get a single session by ID
 * @param {string} sessionId - The session ID
 * @returns {Promise<Object>} - Session object
 */
export const getSessionById = async (sessionId) => {
  try {
    const sessionDoc = await getDoc(doc(db, "sessions", sessionId));

    if (!sessionDoc.exists()) {
      throw new Error("Session not found");
    }

    const sessionData = sessionDoc.data();

    return {
      id: sessionDoc.id,
      ...sessionData,
      date: sessionData.date?.toDate
        ? sessionData.date.toDate().toISOString().split("T")[0]
        : sessionData.date,
    };
  } catch (error) {
    console.error("Error fetching session:", error);
    throw error;
  }
};

/**
 * Create a new session
 * @param {Object} sessionData - Session data
 * @returns {Promise<Object>} - Created session
 */
export const createSession = async (sessionData) => {
  try {
    const dateObj = new Date(sessionData.date);

    const sessionToCreate = {
      ...sessionData,
      date: Timestamp.fromDate(dateObj),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "sessions"), sessionToCreate);

    return {
      id: docRef.id,
      ...sessionData,
    };
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
};

/**
 * Update an existing session
 * @param {string} sessionId - The session ID
 * @param {Object} sessionData - Updated session data
 * @returns {Promise<Object>} - Updated session
 */
export const updateSession = async (sessionId, sessionData) => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);

    let updateData = { ...sessionData, updatedAt: serverTimestamp() };

    if (sessionData.date) {
      const dateObj = new Date(sessionData.date);
      updateData.date = Timestamp.fromDate(dateObj);
    }

    await updateDoc(sessionRef, updateData);

    return {
      id: sessionId,
      ...sessionData,
    };
  } catch (error) {
    console.error("Error updating session:", error);
    throw error;
  }
};

/**
 * Delete a session
 * @param {string} sessionId - The session ID
 * @returns {Promise<void>}
 */
export const deleteSession = async (sessionId) => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    await deleteDoc(sessionRef);
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
};

/**
 * Get sessions for a specific date range (for calendar)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - List of sessions
 */
export const getSessionsForDateRange = async (startDate, endDate) => {
  return getAllSessions({
    startDate,
    endDate,
  });
};
