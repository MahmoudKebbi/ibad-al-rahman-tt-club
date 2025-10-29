import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/layout/PageHeader";
import ContentCard from "../../components/layout/ContentCard";
import ActionButton from "../../components/common/ActionButton";
import AlertMessage from "../../components/common/AlertMessage";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, storage, db } from "../../services/firebase/config";

const ProfilePhoto = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadAlert, setUploadAlert] = useState(null);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadAlert({
          type: "error",
          message: "File is too large. Maximum size is 5MB.",
        });
        return;
      }

      if (!file.type.match("image.*")) {
        setUploadAlert({
          type: "error",
          message: "Only image files are allowed.",
        });
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear any previous alerts
      setUploadAlert(null);
    }
  };

  // Open file browser
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadAlert({
        type: "error",
        message: "Please select a file first.",
      });
      return;
    }

    setIsUploading(true);
    setUploadAlert(null);

    try {
      // For a real implementation, use Firebase Storage
      // const storageRef = ref(storage, `profile-photos/${user.uid}`);
      // const snapshot = await uploadBytes(storageRef, selectedFile);
      // const photoURL = await getDownloadURL(snapshot.ref);
      //
      // // Update auth profile
      // await updateProfile(auth.currentUser, { photoURL });
      //
      // // Update Firestore document
      // await updateDoc(doc(db, 'users', user.uid), {
      //   photoURL,
      //   updatedAt: new Date()
      // });

      // Simulate success for demo
      setTimeout(() => {
        setUploadAlert({
          type: "success",
          message: "Profile photo uploaded successfully!",
        });

        // Navigate after a short delay
        setTimeout(() => {
          navigate("/member/profile");
        }, 2000);
      }, 1500);
    } catch (error) {
      console.error("Error uploading photo:", error);

      setUploadAlert({
        type: "error",
        message: "Error uploading photo. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/member/profile");
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader
          title="Update Profile Photo"
          showBackButton
          onBackClick={handleCancel}
        />

        {uploadAlert && (
          <AlertMessage
            type={uploadAlert.type}
            message={uploadAlert.message}
            onClose={() => setUploadAlert(null)}
          />
        )}

        <ContentCard>
          <div className="flex flex-col items-center">
            {/* Current photo or preview */}
            <div className="mb-6">
              <div className="h-40 w-40 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-6xl font-medium text-gray-600">
                    {user?.displayName?.charAt(0) || "?"}
                  </span>
                )}
              </div>
            </div>

            {/* File input (hidden) */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            {/* Upload controls */}
            <div className="flex flex-col items-center space-y-4">
              <ActionButton
                color="blue"
                onClick={handleBrowseClick}
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
              >
                Browse for Photo
              </ActionButton>

              {selectedFile && (
                <div className="text-sm text-gray-500">
                  Selected: {selectedFile.name}
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 w-full flex justify-center">
                <ActionButton
                  color="green"
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  icon={
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  }
                >
                  {isUploading ? "Uploading..." : "Upload Photo"}
                </ActionButton>
              </div>
            </div>

            {/* Guidelines */}
            <div className="mt-8 text-sm text-gray-500 max-w-md text-center">
              <h4 className="font-medium text-gray-700 mb-2">
                Photo Guidelines:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>Maximum file size: 5MB</li>
                <li>Supported formats: JPG, PNG, GIF</li>
                <li>For best results, upload a square image</li>
                <li>Your face should be clearly visible</li>
              </ul>
            </div>
          </div>
        </ContentCard>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePhoto;
