import React from "react";
import PropTypes from "prop-types";
import ActionButton from "../common/ActionButton";

const FormButtonGroup = ({
  onSubmit,
  onCancel,
  submitText = "Submit",
  cancelText = "Cancel",
  isSubmitting = false,
  submitColor = "green",
  cancelColor = "gray",
  align = "right",
}) => {
  // Define alignment classes
  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  const alignClass = alignmentClasses[align] || alignmentClasses.right;

  return (
    <div
      className={`flex flex-wrap space-y-2 md:space-y-0 md:space-x-3 mt-6 ${alignClass}`}
    >
      {onCancel && (
        <ActionButton
          type="button"
          color={cancelColor}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelText}
        </ActionButton>
      )}

      <ActionButton
        type="submit"
        color={submitColor}
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
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
            Processing...
          </>
        ) : (
          submitText
        )}
      </ActionButton>
    </div>
  );
};

FormButtonGroup.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  submitText: PropTypes.string,
  cancelText: PropTypes.string,
  isSubmitting: PropTypes.bool,
  submitColor: PropTypes.string,
  cancelColor: PropTypes.string,
  align: PropTypes.oneOf(["left", "center", "right", "between"]),
};

export default FormButtonGroup;
