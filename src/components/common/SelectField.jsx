import React from 'react';
import PropTypes from 'prop-types';

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error = '',
  required = false,
  disabled = false,
  className = '',
  helpText = ''
}) => {
  // Generate a unique ID for the select
  const selectId = `select-${name}`;
  
  return (
    <div className={`mb-4 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Select input */}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} 
                  rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500
                  ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                  transition-colors`}
      >
        {/* Placeholder option */}
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {/* Map through options */}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 animate-fadeIn">
          {error}
        </p>
      )}
      
      {/* Help text */}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

SelectField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  helpText: PropTypes.string
};

export default SelectField;