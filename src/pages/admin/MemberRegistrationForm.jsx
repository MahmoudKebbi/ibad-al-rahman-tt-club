import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/layout/PageHeader";
import FormSection from "../../components/form/FormSection";
import InputField from "../../components/common/InputField";
import SelectField from "../../components/common/SelectField";
import CheckboxField from "../../components/common/CheckboxField";
import FormButtonGroup from "../../components/form/FormButtonGroup";
import AlertMessage from "../../components/common/AlertMessage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../services/firebase/config";
import { useNavigate } from "react-router-dom";

const MemberRegistrationForm = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    address: "",
    city: "",
    membershipType: "",
    playingLevel: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    agreeToTerms: false,
  });

  // Submission and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState(null);

  // Options for select fields
  const membershipOptions = [
    { value: "once", label: "Monthly ($50/month)" },
    { value: "quarterly", label: "Quarterly ($135/quarter)" },
    { value: "annual", label: "Annual ($480/year)" },
  ];

  const playingLevelOptions = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "competitive", label: "Competitive" },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error for this field when changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Validate the form
  const validateForm = () => {
    const errors = {};

    // Required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "membershipType",
      "playingLevel",
      "agreeToTerms",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] =
          field === "agreeToTerms"
            ? "You must agree to the terms and conditions"
            : "This field is required";
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (
      formData.phone &&
      !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      errors.phone = "Please enter a valid phone number";
    }

    // Emergency contact phone validation (if provided)
    if (
      formData.emergencyContactPhone &&
      !/^\+?[0-9]{10,15}$/.test(
        formData.emergencyContactPhone.replace(/\s/g, ""),
      )
    ) {
      errors.emergencyContactPhone = "Please enter a valid phone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      setFormAlert({
        type: "error",
        message: "Please fix the errors in the form before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    setFormAlert(null);

    try {
      // Create a user account with email (this would typically be handled by a secure admin API)
      // For demo purposes only - in a real app, this should be done securely
      const randomPassword = Math.random().toString(36).slice(-8);

      // Create the user account in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        randomPassword,
      );

      // Create user document in Firestore
      const userDocRef = await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phoneNumber: formData.phone,
        birthDate: formData.birthDate,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        membershipType: formData.membershipType,
        playingLevel: formData.playingLevel,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
        },
        role: "member",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create a separate membership document
      await addDoc(collection(db, "memberships"), {
        userId: userCredential.user.uid,
        membershipType: formData.membershipType,
        startDate: new Date(),
        status: "active",
        createdAt: serverTimestamp(),
      });

      // Show success message
      setFormAlert({
        type: "success",
        message:
          "Member registered successfully! A password reset email has been sent to the member.",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthDate: "",
        gender: "",
        address: "",
        city: "",
        membershipType: "",
        playingLevel: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        agreeToTerms: false,
      });

      // Navigate after a short delay
      setTimeout(() => {
        navigate("/admin/members");
      }, 2000);
    } catch (error) {
      console.error("Error registering member:", error);

      setFormAlert({
        type: "error",
        message:
          error.code === "auth/email-already-in-use"
            ? "A user with this email already exists."
            : "An error occurred while registering the member. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/admin/members");
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader
          title="Register New Member"
          showBackButton={true}
          onBackClick={handleCancel}
        />

        {formAlert && (
          <AlertMessage
            type={formAlert.type}
            message={formAlert.message}
            onClose={() => setFormAlert(null)}
          />
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <FormSection
            title="Personal Information"
            description="Enter the member's basic personal information."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                error={formErrors.firstName}
                placeholder="Enter first name"
              />

              <InputField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                error={formErrors.lastName}
                placeholder="Enter last name"
              />

              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                error={formErrors.email}
                placeholder="Enter email address"
                helpText="This will be used for login and communications."
              />

              <InputField
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                error={formErrors.phone}
                placeholder="Enter phone number"
              />

              <InputField
                label="Birth Date"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                error={formErrors.birthDate}
              />

              <SelectField
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={genderOptions}
                error={formErrors.gender}
                placeholder="Select gender"
              />
            </div>
          </FormSection>

          {/* Address Information */}
          <FormSection
            title="Address Information"
            description="Enter the member's address details."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={formErrors.address}
                  placeholder="Enter street address"
                />
              </div>

              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={formErrors.city}
                placeholder="Enter city"
              />
            </div>
          </FormSection>

          {/* Membership Details */}
          <FormSection
            title="Membership Details"
            description="Specify the type of membership and playing level."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Membership Type"
                name="membershipType"
                value={formData.membershipType}
                onChange={handleChange}
                options={membershipOptions}
                required
                error={formErrors.membershipType}
                placeholder="Select membership type"
              />

              <SelectField
                label="Playing Level"
                name="playingLevel"
                value={formData.playingLevel}
                onChange={handleChange}
                options={playingLevelOptions}
                required
                error={formErrors.playingLevel}
                placeholder="Select playing level"
              />
            </div>
          </FormSection>

          {/* Emergency Contact */}
          <FormSection
            title="Emergency Contact"
            description="Provide details of someone to contact in case of emergency."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Contact Name"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                error={formErrors.emergencyContactName}
                placeholder="Enter emergency contact name"
              />

              <InputField
                label="Contact Phone"
                name="emergencyContactPhone"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                error={formErrors.emergencyContactPhone}
                placeholder="Enter emergency contact phone"
              />
            </div>
          </FormSection>

          {/* Terms and Conditions */}
          <FormSection>
            <CheckboxField
              label="I agree to the terms and conditions of the Ibad Al Rahman Table Tennis Club"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
              error={formErrors.agreeToTerms}
              helpText="By checking this box, you confirm that the information provided is accurate and that you've obtained consent to share this information."
            />

            <FormButtonGroup
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitText="Register Member"
              isSubmitting={isSubmitting}
              align="right"
            />
          </FormSection>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default MemberRegistrationForm;
