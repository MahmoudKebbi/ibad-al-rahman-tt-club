import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  signInAnonymously,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

//Email/Password sign in
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

//Google sign in
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);

    // Check if this is the first time the user is signing in with Google
    const { isNewUser } = getAdditionalUserInfo(userCredential);

    if (isNewUser) {
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || "User",
        photoURL: userCredential.user.photoURL,
        phoneNumber: userCredential.user.phoneNumber || "",
        role: "guest", // Default role for new Google users
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return userCredential.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Get current user data from Firestore
export const getCurrentUserData = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      throw new Error("User data not found");
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

// Listen to auth state changes
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Get additional user data from Firestore
        const userData = await getCurrentUserData(user.uid);
        callback({ user, userData, isAuthenticated: true });
      } catch (error) {
        console.error("Error in auth state change:", error);
        callback({ user: null, userData: null, isAuthenticated: false, error });
      }
    } else {
      callback({ user: null, userData: null, isAuthenticated: false });
    }
  });
};

// Anonymous (Guest) Sign In
export const signInAsGuest = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    // Create a guest profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: null,
      displayName: `Guest-${user.uid.substring(0, 5)}`,
      phoneNumber: "",
      role: "guest",
      isAnonymous: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    console.error("Error signing in as guest:", error);
    throw error;
  }
};

// Create a new user (admin function)
export const createUser = async (
  email,
  password,
  displayName,
  role,
  phoneNumber = ""
) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      displayName,
      phoneNumber,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Update user role (admin function)
export const updateUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        role: newRole,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};
