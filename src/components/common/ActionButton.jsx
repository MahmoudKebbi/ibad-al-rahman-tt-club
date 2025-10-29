import React from "react";
import PropTypes from "prop-types";

const ActionButton = ({
  children,
  onClick,
  icon,
  color = "green",
  size = "md",
  type = "button",
  disabled = false,
  className = "",
  fullWidth = false,
}) => {
  // Map of color variants
  const colorClasses = {
    green: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    red: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    yellow: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    purple: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
    gray: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500",
  };

  // Map of size variants
  const sizeClasses = {
    sm: "py-1 px-3 text-xs",
    md: "py-2 px-4 text-sm",
    lg: "py-3 px-6 text-base",
  };

  const buttonColor = colorClasses[color] || colorClasses.green;
  const buttonSize = sizeClasses[size] || sizeClasses.md;
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center ${buttonSize} ${widthClass} border border-transparent rounded-md shadow-sm font-medium text-white ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

ActionButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  color: PropTypes.oneOf(["green", "blue", "red", "yellow", "purple", "gray"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
};

export default ActionButton;
