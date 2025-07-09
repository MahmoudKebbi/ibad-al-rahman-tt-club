import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { db, storage, auth } from "./config";

// Get all users (for admin)
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null,
    }));

    return { success: true, users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));

    if (userDoc.exists()) {
      const userData = {
        id: userDoc.id,
        ...userDoc.data(),
        createdAt: userDoc.data().createdAt?.toDate() || null,
        updatedAt: userDoc.data().updatedAt?.toDate() || null,
      };

      return { success: true, userData };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, "users", userId);

    // Add timestamp
    profileData.updatedAt = serverTimestamp();

    await updateDoc(userRef, profileData);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload profile photo
export const uploadProfilePhoto = async (userId, file) => {
  try {
    // Create storage reference
    const storageRef = ref(storage, `profile-photos/${userId}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const photoURL = await getDownloadURL(snapshot.ref);

    // Update auth profile
    if (auth.currentUser && auth.currentUser.uid === userId) {
      await updateProfile(auth.currentUser, { photoURL });
    }

    // Update Firestore document
    await updateDoc(doc(db, "users", userId), {
      photoURL,
      updatedAt: serverTimestamp(),
    });

    return { success: true, photoURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user membership data
export const getUserMembership = async (userId) => {
  try {
    const membershipQuery = query(
      collection(db, "memberships"),
      where("userId", "==", userId),
      orderBy("startDate", "desc"),
      limit(1)
    );

    const querySnapshot = await getDocs(membershipQuery);

    if (!querySnapshot.empty) {
      const membershipDoc = querySnapshot.docs[0];
      const membershipData = {
        id: membershipDoc.id,
        ...membershipDoc.data(),
        startDate: membershipDoc.data().startDate?.toDate() || null,
        expiryDate: membershipDoc.data().expiryDate?.toDate() || null,
        createdAt: membershipDoc.data().createdAt?.toDate() || null,
        updatedAt: membershipDoc.data().updatedAt?.toDate() || null,
      };

      return { success: true, membershipData };
    } else {
      return { success: false, error: "No membership found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Change user role (admin only)
export const changeUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
