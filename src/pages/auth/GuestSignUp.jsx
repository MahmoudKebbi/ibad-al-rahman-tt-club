import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  signIn,
  signInWithGoogle,
  signInAsGuest,
  resetPassword,
  signUpAsGuest,
  checkEmailExists,
} from "../../services/firebase/auth";
import { clearError } from "../../store/slices/authSlice";

//TODO: Continue with the guest sign-up functionality

const GuestSignUp = () => {
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false); // Track email validity
  const [emailExists, setEmailExists] = useState(false); // Track if email already exists
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null); // Track password match state

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { error, isAuthenticated, role } = useSelector((state) => state.auth);

  // Check if passwords match
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordMatch(value === confirmPassword && value.length > 0); // Update match state based on current password and confirm password
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(
      value.includes("@") && value.length > 5 && value.includes("."),
    ); // Simple email validation
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setPasswordMatch(value === password && password.length > 0); // Update match state based on current confirm password and password
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !passwordMatch) {
      return;
    }

    try {
      setLoading(true);
      dispatch(clearError());

      const exists = await checkEmailExists(email);
      console.log("Email exists:", exists);
      if (exists) {
        setEmailExists(true);
        setLoading(false);
        return;
      } else {
        await signUpAsGuest(email, password);
        console.log("Sign-up successful");
        setEmailExists(false);
        // Redirect to login page after successful sign-up
        navigate("/login");
      }
    } catch (error) {
      console.error("Sign-up error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="h-screen w-screen flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-green-600 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-700 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/public/table-tennis-background.png')] bg-cover bg-center"></div>
          <div className="bg-white/30 backdrop-blur-lg relative z-10 px-4 text-white text-center w-full">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 py-6 flex justify-center w-full m-0 text-white-900">
              Ibad Al Rahman
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-white-700">
              Table Tennis Club
            </h2>
            <p className="text-lg opacity-90 mb-8 text-white-500">
              Welcome to our community of table tennis enthusiasts.
            </p>
          </div>
        </div>

        <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800">
                We Are Pleased To Have You On Board!
              </h2>
              <p className="text-gray-600 mt-2">
                Please fill in your email and password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  className={`peer w-full px-4 py-3 border-b-2 ${
                    emailValid === false
                      ? "border-red-500"
                      : emailValid === true
                        ? "border-green-500"
                        : "border-gray-300"
                  } placeholder-transparent focus:outline-none focus:border-green-500 transition-colors bg-gray-50 rounded-t-md`}
                  placeholder="Email"
                  value={email}
                  onChange={(e) => handleEmailChange(e)}
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 -top-5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-gray-600 peer-focus:text-sm"
                >
                  Email address
                </label>
              </div>

              {emailValid === true && emailExists === false && (
                <div className="text-green-500 text-sm">Email Valid</div>
              )}
              {emailExists === true && (
                <div className="text-red-500 text-sm">Email already exists</div>
              )}

              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  className={`peer w-full px-4 py-3 border-b-2 ${
                    passwordMatch === false
                      ? "border-red-500"
                      : passwordMatch === true
                        ? "border-green-500"
                        : "border-gray-300"
                  } placeholder-transparent focus:outline-none focus:border-green-500 transition-colors bg-gray-50 rounded-t-md`}
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <label
                  htmlFor="password"
                  className="absolute left-4 -top-5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-gray-600 peer-focus:text-sm"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className={`peer w-full px-4 py-3 border-b-2 ${
                    passwordMatch === false
                      ? "border-red-500"
                      : passwordMatch === true
                        ? "border-green-500"
                        : "border-gray-300"
                  } placeholder-transparent focus:outline-none focus:border-green-500 transition-colors bg-gray-50 rounded-t-md`}
                  placeholder="Re-enter Password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                />
                <label
                  htmlFor="confirmPassword"
                  className="absolute left-4 -top-5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-gray-600 peer-focus:text-sm"
                >
                  Re-enter Password
                </label>
              </div>

              {passwordMatch === false && (
                <div className="text-red-500 text-sm">
                  Passwords do not match
                </div>
              )}
              {passwordMatch === true && (
                <div className="text-green-500 text-sm">Passwords match</div>
              )}

              <button
                type="submit"
                disabled={!passwordMatch || loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-md font-medium transition-transform transform hover:scale-[1.02] focus:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg flex justify-center items-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Signing up...</span>
                  </>
                ) : (
                  "Sign up"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestSignUp;
