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
    // Set loading true while we check authentication state
    dispatch(setLoading(true));

    // Subscribe to authentication state changes from Firebase
    const unsubscribe = subscribeToAuthChanges((authState) => {
      if (authState.isAuthenticated) {
        dispatch(
          loginSuccess({
            user: authState.user,
            userData: authState.userData,
          })
        );
      } else if (authState.error) {

        dispatch(loginFailure(authState.error.message));
      } else {
        dispatch(logoutSuccess());
      }
    });

    // Cleanup
    return () => unsubscribe();
  }, [dispatch]);
};

export default useAuth;
