import React from "react";
import PropTypes from "prop-types";

const StatsCard = ({ title, value, icon, color = "green" }) => {
  // Map of color classes - this object maps color names to their corresponding CSS classes
  const colorClasses = {
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
    },
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
    },
    yellow: {
      bg: "bg-yellow-100",
      text: "text-yellow-600",
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-600",
    },
  };

  // Get the classes for the selected color, or fallback to green if the color isn't in our map
  const classes = colorClasses[color] || colorClasses.green;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${classes.bg} rounded-full p-3`}>
          {icon || (
            <svg
              className={`h-8 w-8 ${classes.text}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          )}
        </div>
        <div className="ml-4">
          <h3 className="text-gray-500 text-sm">{title}</h3>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.element,
  color: PropTypes.oneOf(["green", "blue", "purple", "yellow", "red"]),
};

export default StatsCard;
