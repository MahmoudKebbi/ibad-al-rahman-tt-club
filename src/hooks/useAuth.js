import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { subscribeToAuthChanges } from "../services/firebase/auth";
import {
  setLoading,
  loginSuccess,
  loginFailure,
  logoutSuccess,
} from "../store/slices/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLoading(true));
    console.log("Setting up auth subscription");

    const unsubscribe = subscribeToAuthChanges((authState) => {
      console.log("Auth state changed:", authState);

      if (authState.isAuthenticated && authState.user && authState.userData) {
        // Process the userData to make it serializable
        console.log("Processing user data for serialization");
        const processedUserData = processFirestoreData(authState.userData);

        const userData = {
          uid: authState.user.uid,
          email: authState.user.email,
          displayName:
            processedUserData?.displayName || authState.user.displayName,
          photoURL: processedUserData?.photoURL || authState.user.photoURL,
          role: processedUserData?.role || "guest",
          isAnonymous: authState.user.isAnonymous || false,
          phoneNumber:
            processedUserData?.phoneNumber || authState.user.phoneNumber,
          ...processedUserData, // Now contains serializable data
        };

        console.log("Processed user data:", userData);

        // Dispatch login success with the combined user data
        console.log("🔥🔥🔥🔥🔥🔥🔥Dispatching login success with user data");
        dispatch(
          loginSuccess({
            user: {
              uid: authState.user.uid,
              email: authState.user.email,
              displayName:
                processedUserData?.displayName || authState.user.displayName,
              photoURL: processedUserData?.photoURL || authState.user.photoURL,
              role: processedUserData?.role || "guest", // Include role in user object
              // Other user properties
            },
            userData: processedUserData,
            role: processedUserData?.role || "guest", // Keep top-level role
          }),
        );
        console.log("User authenticated:", userData.role);
      } else if (authState.error) {
        // Authentication error occurred
        console.error("Auth error:", authState.error);
        dispatch(
          loginFailure(authState.error.message || "Authentication error"),
        );
      } else {
        // User is not authenticated
        console.log("User not authenticated");
        dispatch(logoutSuccess());
      }

      // Regardless of auth state, we're no longer loading
      dispatch(setLoading(false));
    });

    // Cleanup subscription when component unmounts
    return () => {
      console.log("Cleaning up auth subscription");
      unsubscribe();
    };
  }, [dispatch]);
};

// Add this helper function to process Firestore data
function processFirestoreData(firestoreData) {
  if (!firestoreData) return null;

  // Create a new object to avoid mutating the original
  const processed = { ...firestoreData };

  // Convert Timestamp objects to ISO strings or timestamps
  Object.keys(processed).forEach((key) => {
    const value = processed[key];

    // Check if the value is a Firebase Timestamp
    if (value && typeof value.toDate === "function") {
      // Convert to ISO string (or you could use value.seconds for Unix timestamp)
      processed[key] = value.toDate().toISOString();
    } else if (value && typeof value === "object") {
      // Recursively process nested objects
      processed[key] = processFirestoreData(value);
    }
  });

  return processed;
}

export default useAuth;
