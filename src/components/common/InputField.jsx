import React from "react";
import PropTypes from "prop-types";

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
  disabled = false,
  className = "",
  helpText = "",
  icon = null,
  onIconClick = null,
}) => {
  // Generate a unique ID for the input
  const inputId = `input-${name}`;

  return (
    <div className={`mb-4 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container with optional icon */}
      <div className="relative">
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border ${error ? "border-red-500" : "border-gray-300"} 
                      rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500
                      ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
                      ${icon ? "pr-10" : ""}
                      transition-colors`}
        />

        {/* Optional icon */}
        {icon && (
          <div
            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${onIconClick ? "cursor-pointer" : ""}`}
            onClick={onIconClick}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 animate-fadeIn">{error}</p>
      )}

      {/* Help text */}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

InputField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf([
    "text",
    "email",
    "password",
    "number",
    "tel",
    "url",
    "date",
    "time",
    "datetime-local",
  ]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  helpText: PropTypes.string,
  icon: PropTypes.node,
  onIconClick: PropTypes.func,
};

export default InputField;
