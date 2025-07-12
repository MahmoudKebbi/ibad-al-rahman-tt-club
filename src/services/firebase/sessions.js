import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";


export const getAllSessions = async (filter = {}) => {
  try {
    let sessionsQuery = collection(db, "sessions");


    if (filter.upcoming) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      sessionsQuery = query(
        sessionsQuery,
        where("date", ">=", today),
        orderBy("date", "asc")
      );
    } else if (filter.past) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      sessionsQuery = query(
        sessionsQuery,
        where("date", "<", today),
        orderBy("date", "desc")
      );
    } else {
      sessionsQuery = query(sessionsQuery, orderBy("date", "desc"));
    }


    if (filter.coach) {
      sessionsQuery = query(sessionsQuery, where("coach", "==", filter.coach));
    }


    if (filter.type) {
      sessionsQuery = query(sessionsQuery, where("type", "==", filter.type));
    }

    const querySnapshot = await getDocs(sessionsQuery);

    const sessions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || null,
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null,
    }));

    return { success: true, sessions };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


export const getSessionById = async (sessionId) => {
  try {
    const sessionDoc = await getDoc(doc(db, "sessions", sessionId));

    if (sessionDoc.exists()) {
      const sessionData = {
        id: sessionDoc.id,
        ...sessionDoc.data(),
        date: sessionDoc.data().date?.toDate() || null,
        createdAt: sessionDoc.data().createdAt?.toDate() || null,
        updatedAt: sessionDoc.data().updatedAt?.toDate() || null,
      };

      return { success: true, sessionData };
    } else {
      return { success: false, error: "Session not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Create a new session in Firestore.
 * @param {Object} sessionData - The session data to be saved.
 * @returns {Object} - Success status and session ID or error message.
 */
export const createSession = async (sessionData) => {
  try {

    if (!sessionData.title || !sessionData.date || !sessionData.coach) {
      throw new Error("Missing required fields: title, date, or coach");
    }


    if (typeof sessionData.date === "string") {
      sessionData.date = new Date(sessionData.date);
    }


    sessionData.createdAt = serverTimestamp();
    sessionData.updatedAt = serverTimestamp();

    // Write to Firestore
    const docRef = await addDoc(collection(db, "sessions"), sessionData);

    console.log("Session created successfully:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating session:", error.message);
    return { success: false, error: error.message };
  }
};

// Update session
export const updateSession = async (sessionId, sessionData) => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);

    // Format date if it's a string
    if (typeof sessionData.date === "string") {
      sessionData.date = new Date(sessionData.date);
    }

    // Add timestamp
    sessionData.updatedAt = serverTimestamp();

    await updateDoc(sessionRef, sessionData);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete session
export const deleteSession = async (sessionId) => {
  try {
    await deleteDoc(doc(db, "sessions", sessionId));

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get sessions for specific date range
export const getSessionsByDateRange = async (startDate, endDate) => {
  try {
    const sessionsQuery = query(
      collection(db, "sessions"),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "asc")
    );

    const querySnapshot = await getDocs(sessionsQuery);

    const sessions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || null,
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null,
    }));

    return { success: true, sessions };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Register user for session
export const registerForSession = async (sessionId, userId) => {
  try {
    // First check if session exists and has space
    const { success, sessionData, error } = await getSessionById(sessionId);

    if (!success) {
      return { success: false, error };
    }

    // Check if session is full
    const participants = sessionData.participants || [];
    if (participants.length >= sessionData.maxParticipants) {
      return { success: false, error: "Session is full" };
    }

    // Check if user is already registered
    if (participants.includes(userId)) {
      return {
        success: false,
        error: "User already registered for this session",
      };
    }

    // Add user to participants
    participants.push(userId);

    // Update session
    await updateDoc(doc(db, "sessions", sessionId), {
      participants,
      updatedAt: serverTimestamp(),
    });

    // Also create a registration record
    await addDoc(collection(db, "sessionRegistrations"), {
      sessionId,
      userId,
      registeredAt: serverTimestamp(),
      status: "confirmed",
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Cancel registration
export const cancelRegistration = async (sessionId, userId) => {
  try {
    // First check if session exists
    const { success, sessionData, error } = await getSessionById(sessionId);

    if (!success) {
      return { success: false, error };
    }

    // Check if user is registered
    const participants = sessionData.participants || [];
    if (!participants.includes(userId)) {
      return { success: false, error: "User not registered for this session" };
    }

    // Remove user from participants
    const updatedParticipants = participants.filter((id) => id !== userId);

    // Update session
    await updateDoc(doc(db, "sessions", sessionId), {
      participants: updatedParticipants,
      updatedAt: serverTimestamp(),
    });

    // Find and update registration record
    const registrationsQuery = query(
      collection(db, "sessionRegistrations"),
      where("sessionId", "==", sessionId),
      where("userId", "==", userId),
      where("status", "==", "confirmed")
    );

    const querySnapshot = await getDocs(registrationsQuery);

    if (!querySnapshot.empty) {
      const registrationDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "sessionRegistrations", registrationDoc.id), {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
