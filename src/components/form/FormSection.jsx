import React from 'react';
import PropTypes from 'prop-types';

const FormSection = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-sm text-gray-500 mb-4">
          {description}
        </p>
      )}
      
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
        {children}
      </div>
    </div>
  );
};

FormSection.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default FormSection;