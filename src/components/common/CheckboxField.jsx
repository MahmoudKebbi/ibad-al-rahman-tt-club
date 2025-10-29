import React from "react";
import PropTypes from "prop-types";

const CheckboxField = ({
  label,
  name,
  checked,
  onChange,
  error = "",
  disabled = false,
  className = "",
  helpText = "",
}) => {
  // Generate a unique ID for the checkbox
  const checkboxId = `checkbox-${name}`;

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={checkboxId}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={`h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500
                      ${disabled ? "opacity-60 cursor-not-allowed" : ""}
                      ${error ? "border-red-500" : ""}`}
          />
        </div>
        <div className="ml-3 text-sm">
          {label && (
            <label
              htmlFor={checkboxId}
              className={`font-medium ${disabled ? "text-gray-400" : "text-gray-700"}`}
            >
              {label}
            </label>
          )}

          {/* Help text */}
          {helpText && <p className="text-gray-500">{helpText}</p>}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 animate-fadeIn">{error}</p>
      )}
    </div>
  );
};

CheckboxField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  helpText: PropTypes.string,
};

export default CheckboxField;
