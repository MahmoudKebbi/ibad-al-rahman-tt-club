import {
  collection,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  doc,
  arrayUnion,
  Timestamp,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";
import {
  getMembershipById,
  calculateMembershipExpiration,
  PaymentStatus,
} from "../../models/Payment";

export const recordMembershipPayment = async (
  memberId,
  membershipTypeId,
  paymentData,
) => {
  try {
    const membershipDetails = getMembershipById(membershipTypeId);
    if (!membershipDetails) {
      throw new Error(`Invalid membership type: ${membershipTypeId}`);
    }

    const userRef = doc(db, "users", memberId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const userData = userSnap.data();

    // Get member profile data
    const memberProfileRef = doc(db, "memberProfiles", memberId);
    const memberProfileSnap = await getDoc(memberProfileRef);

    if (!memberProfileSnap.exists()) {
      throw new Error("Member profile not found");
    }

    // Prepare payment document data
    const paymentDate = paymentData.paymentDate || new Date();
    const expirationDate = calculateMembershipExpiration(
      membershipTypeId,
      paymentDate,
    );

    const paymentRecord = {
      memberId,
      memberName: userData.displayName || userData.email,
      membershipType: membershipTypeId,
      membershipName: membershipDetails.name,
      amount: paymentData.amount || membershipDetails.price,
      paymentMethod: paymentData.paymentMethod,
      paymentDate: paymentDate,
      expirationDate: expirationDate,
      status: PaymentStatus.COMPLETED,
      notes: paymentData.notes || "",
      receiptNumber: paymentData.receiptNumber || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      recordedBy: {
        uid: paymentData.recordedBy || "MahmoudKebbi",
        timestamp: serverTimestamp(),
      },
    };

    // Add payment record to payments collection
    const paymentRef = await addDoc(collection(db, "payments"), paymentRecord);

    // Update user document
    await updateDoc(userRef, {
      membershipType: membershipTypeId,
      membershipStatus: "active",
      membershipExpiration: expirationDate,
      updatedAt: serverTimestamp(),
    });

    // Update member profile
    await updateDoc(memberProfileRef, {
      membershipType: membershipTypeId,
      membershipStatus: "active",
      paymentHistory: arrayUnion(paymentRef.id),
      // Reset weekly and monthly usage counters on membership renewal
      daysUsedThisWeek: 0,
      daysUsedThisMonth: 0,
      // Set reset dates based on current date
      weeklyResetDate: getNextWeeklyResetDate(paymentDate),
      monthlyResetDate: getNextMonthlyResetDate(paymentDate),
      updatedAt: serverTimestamp(),
    });

    return {
      id: paymentRef.id,
      ...paymentRecord,
    };
  } catch (error) {
    console.error("Error recording payment:", error);
    throw error;
  }
};

// Get all payments for a member
export const getMemberPayments = async (memberId) => {
  try {
    const paymentsQuery = query(
      collection(db, "payments"),
      where("memberId", "==", memberId),
      orderBy("paymentDate", "desc"),
    );

    const querySnapshot = await getDocs(paymentsQuery);

    const payments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      paymentDate:
        doc.data().paymentDate instanceof Timestamp
          ? doc.data().paymentDate.toDate()
          : doc.data().paymentDate,
      expirationDate:
        doc.data().expirationDate instanceof Timestamp
          ? doc.data().expirationDate.toDate()
          : doc.data().expirationDate,
      createdAt:
        doc.data().createdAt instanceof Timestamp
          ? doc.data().createdAt.toDate()
          : doc.data().createdAt,
    }));

    return payments;
  } catch (error) {
    console.error("Error fetching member payments:", error);
    throw error;
  }
};

// Get all payments for admin
export const getAllPayments = async () => {
  try {
    const paymentsQuery = query(
      collection(db, "payments"),
      orderBy("paymentDate", "desc"),
    );

    const querySnapshot = await getDocs(paymentsQuery);

    const payments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      paymentDate:
        doc.data().paymentDate instanceof Timestamp
          ? doc.data().paymentDate.toDate()
          : doc.data().paymentDate,
      expirationDate:
        doc.data().expirationDate instanceof Timestamp
          ? doc.data().expirationDate.toDate()
          : doc.data().expirationDate,
      createdAt:
        doc.data().createdAt instanceof Timestamp
          ? doc.data().createdAt.toDate()
          : doc.data().createdAt,
    }));

    return payments;
  } catch (error) {
    console.error("Error fetching all payments:", error);
    throw error;
  }
};

// Get a single payment by ID
export const getPaymentById = async (paymentId) => {
  try {
    const paymentDoc = await getDoc(doc(db, "payments", paymentId));

    if (!paymentDoc.exists()) {
      throw new Error("Payment not found");
    }

    const payment = paymentDoc.data();

    return {
      id: paymentDoc.id,
      ...payment,
      paymentDate:
        payment.paymentDate instanceof Timestamp
          ? payment.paymentDate.toDate()
          : payment.paymentDate,
      expirationDate:
        payment.expirationDate instanceof Timestamp
          ? payment.expirationDate.toDate()
          : payment.expirationDate,
      createdAt:
        payment.createdAt instanceof Timestamp
          ? payment.createdAt.toDate()
          : payment.createdAt,
    };
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw error;
  }
};

// Get member profile data
export const getMemberProfile = async (memberId) => {
  try {
    const memberProfileSnap = await getDoc(doc(db, "memberProfiles", memberId));

    if (!memberProfileSnap.exists()) {
      throw new Error("Member profile not found");
    }

    const profile = memberProfileSnap.data();

    // Convert Timestamp objects to Dates
    const formattedProfile = {
      ...profile,
      lastVisit:
        profile.lastVisit instanceof Timestamp
          ? profile.lastVisit.toDate()
          : profile.lastVisit,
      weeklyResetDate:
        profile.weeklyResetDate instanceof Timestamp
          ? profile.weeklyResetDate.toDate()
          : profile.weeklyResetDate,
      monthlyResetDate:
        profile.monthlyResetDate instanceof Timestamp
          ? profile.monthlyResetDate.toDate()
          : profile.monthlyResetDate,
    };

    return formattedProfile;
  } catch (error) {
    console.error("Error fetching member profile:", error);
    throw error;
  }
};

// Helper functions for date calculations
const getNextWeeklyResetDate = (fromDate = new Date()) => {
  const date = new Date(fromDate);
  date.setDate(date.getDate() + 7);
  return date;
};

const getNextMonthlyResetDate = (fromDate = new Date()) => {
  const date = new Date(fromDate);
  date.setMonth(date.getMonth() + 1);
  return date;
};
