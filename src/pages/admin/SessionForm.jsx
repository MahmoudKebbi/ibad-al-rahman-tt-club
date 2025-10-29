import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/layout/PageHeader";
import FormSection from "../../components/form/FormSection";
import InputField from "../../components/common/InputField";
import SelectField from "../../components/common/SelectField";
import FormButtonGroup from "../../components/form/FormButtonGroup";
import AlertMessage from "../../components/common/AlertMessage";
import {
  collection,
  addDoc,
  getDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase/config";
import {
  createSession,
  getAllSessions,
  updateSession,
} from "../../services/firebase/sessions";
import { getUserByRole } from "../../services/firebase/users";

const SessionForm = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const isEditMode = !!sessionId;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    date: "",
    startTime: "",
    endTime: "",
    coach: "",
    maxParticipants: 20,
    description: "",
    status: "scheduled",
  });

  // Submission and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState(null);
  const [coaches, setCoaches] = useState([]);

  // Options for select fields
  const sessionTypeOptions = [
    { value: "regular", label: "Regular Training" },
    { value: "beginner", label: "Beginner Training" },
    { value: "advanced", label: "Advanced Training" },
    { value: "competitive", label: "Competitive Training" },
    { value: "private", label: "Private Lesson" },
    { value: "special", label: "Special Event" },
  ];

  const statusOptions = [
    { value: "scheduled", label: "Scheduled" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Load coaches
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const result = await getUserByRole("coach");

        if (result.success) {
          const coaches = result.users; // Access the users array
          console.log("Coaches:", coaches);

          // Format the coaches array for the SelectField component
          const formattedCoaches = coaches.map((coach) => ({
            value: coach.id, // Use the coach ID as the value
            label: coach.displayName || coach.email, // Use displayName or email as the label
          }));

          console.log("Formatted Coaches:", formattedCoaches);

          setCoaches(formattedCoaches);
        } else {
          console.error("Error fetching coaches:", result.error);
        }
      } catch (error) {
        console.error("Error fetching coaches:", error);
      }
    };

    fetchCoaches();
  }, []);

  // Load session data if in edit mode
  useEffect(() => {
    const fetchSessionData = async () => {
      if (isEditMode) {
        try {
          const { success, sessions } = getAllSessions();

          if (success && sessions.length > 0) {
            const sessionData = sessions.find(
              (session) => session.id === sessionId,
            );
            if (sessionData) {
              setFormData({
                title: sessionData.title || "",
                type: sessionData.type || "",
                date: sessionData.date
                  ? sessionData.date.toISOString().split("T")[0]
                  : "",
                startTime: sessionData.startTime || "",
                endTime: sessionData.endTime || "",
                coach: sessionData.coach || "",
                maxParticipants: sessionData.maxParticipants || 20,
                description: sessionData.description || "",
                status: sessionData.status || "scheduled",
              });
            } else {
              setFormAlert({
                type: "error",
                message: "Session not found.",
              });
            }
          } else {
            setFormAlert({
              type: "error",
              message: "No sessions found. Please create a session first.",
            });
          }
        } catch (error) {
          console.error("Error fetching session data:", error);
          setFormAlert({
            type: "error",
            message: "Error loading session data. Please try again.",
          });
        }
      }
    };

    fetchSessionData();
  }, [isEditMode, sessionId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Convert number input
    const processedValue = type === "number" ? parseInt(value) : value;

    setFormData({
      ...formData,
      [name]: processedValue,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    const requiredFields = [
      "title",
      "type",
      "date",
      "startTime",
      "endTime",
      "coach",
      "maxParticipants",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "This field is required";
      }
    });

    // Validate max participants is a positive number
    if (formData.maxParticipants <= 0) {
      errors.maxParticipants = "Must be a positive number";
    }

    // Validate time (ensure end time is after start time)
    if (
      formData.startTime &&
      formData.endTime &&
      formData.startTime >= formData.endTime
    ) {
      errors.endTime = "End time must be after start time";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const sessionData = {
        ...formData,
        date: new Date(formData.date),
        updatedAt: serverTimestamp(),
      };

      if (!isEditMode) {
        sessionData.createdAt = serverTimestamp();
      }

      if (isEditMode) {
        // TODO Add real implementation

        updateSession(sessionId, sessionData);

        setFormAlert({
          type: "success",
          message: "Session updated successfully!",
        });
      } else {
        createSession(sessionData);

        setFormAlert({
          type: "success",
          message: "Session created successfully!",
        });
      }

      // Navigate after a short delay
      setTimeout(() => {
        navigate("/admin/schedule");
      }, 2000);
    } catch (error) {
      console.error("Error saving session:", error);

      setFormAlert({
        type: "error",
        message: `Error ${isEditMode ? "updating" : "creating"} session. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/admin/schedule");
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <PageHeader
          title={
            isEditMode ? "Edit Training Session" : "Create Training Session"
          }
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
          {/* Session Information */}
          <FormSection
            title="Session Information"
            description="Enter the details for this training session."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField
                  label="Session Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  error={formErrors.title}
                  placeholder="e.g., Regular Training Session"
                />
              </div>

              <SelectField
                label="Session Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={sessionTypeOptions}
                required
                error={formErrors.type}
                placeholder="Select session type"
              />

              <SelectField
                label="Coach"
                name="coach"
                value={formData.coach}
                onChange={handleChange}
                options={coaches}
                required
                error={formErrors.coach}
                placeholder="Select coach"
              />

              <InputField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                error={formErrors.date}
              />

              <div className="grid grid-cols-2 gap-2">
                <InputField
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  error={formErrors.startTime}
                />

                <InputField
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  error={formErrors.endTime}
                />
              </div>

              <InputField
                label="Maximum Participants"
                name="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={handleChange}
                required
                error={formErrors.maxParticipants}
                min="1"
              />

              {isEditMode && (
                <SelectField
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={statusOptions}
                  error={formErrors.status}
                />
              )}

              <div className="md:col-span-2">
                <InputField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter session description"
                  error={formErrors.description}
                />
              </div>
            </div>

            <FormButtonGroup
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitText={isEditMode ? "Update Session" : "Create Session"}
              isSubmitting={isSubmitting}
              align="right"
            />
          </FormSection>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SessionForm;
