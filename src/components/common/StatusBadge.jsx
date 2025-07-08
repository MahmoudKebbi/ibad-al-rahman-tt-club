import React from 'react';
import PropTypes from 'prop-types';

const StatusBadge = ({ status, text, customColor }) => {
  // Default status colors
  const statusColors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800',
    // Role-specific colors
    admin: 'bg-purple-100 text-purple-800',
    member: 'bg-green-100 text-green-800',
    guest: 'bg-gray-100 text-gray-800',
    // Payment status colors
    paid: 'bg-green-100 text-green-800',
    due: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800'
  };

  // Use custom color if provided, otherwise use the status from our predefined map
  const colorClass = customColor || statusColors[status] || statusColors.neutral;

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
      {text || status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  text: PropTypes.string,
  customColor: PropTypes.string
};

export default StatusBadge;