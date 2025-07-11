import {
  firebase,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  signInAnonymously,
  sendPasswordResetEmail,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
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
    console.log("User signed in:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error.code, error.message);
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
    console.log("User signed in with Google:", userCredential.user);
    if (isNewUser) {
      console.log("New user signed in with Google:", userCredential.user);
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

      console.log(
        "New user profile created in Firestore:",
        userCredential.user.uid
      );
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
    console.log("Fetching user data for UID:", uid);
    console.log("Firestore DB:", db);
    console.log("Auth instance:", auth);

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
        console.log("User is authenticated:", user.uid);
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

export const signInAsGuest = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log("Guest user signed in:", user);

    return user;
  } catch (error) {
    console.error("Error signing in as guest:", error);
    throw error;
  }
};

export const checkEmailExists = async (email) => {
  try {
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    console.log("Sign-in methods for email:", signInMethods);
    return signInMethods.length > 0;
  } catch (error) {
    console.error("Error checking email existence:", error);
    throw error;
  }
};

export const signUpAsGuest = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await sendEmailVerification(auth.currentUser);
    console.log("Guest user signed up:", user);

    // Create a guest profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
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

export const createUser = async (
  email,
  displayName,
  role,
  phoneNumber = ""
) => {
  // Create random temporary password (never stored or seen)
  const tempPassword = Math.random().toString(36).slice(-10);

  // Create user with temporary password
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    tempPassword
  );
  const user = userCredential.user;

  // Send password reset email immediately
  await sendPasswordResetEmail(auth, email);

  // Store user data in Firestore
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

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};
