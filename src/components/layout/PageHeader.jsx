import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const PageHeader = ({
  title,
  children,
  showBackButton = false,
  backButtonLabel = "Back",
  onBackClick,
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1); // Default behavior: go back one page in history
    }
  };

  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-6">
      <div className="flex items-center">
        {showBackButton && (
          <button
            onClick={handleBackClick}
            className="mr-3 text-gray-600 hover:text-gray-900 flex items-center"
          >
            <svg
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm">{backButtonLabel}</span>
          </button>
        )}
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      </div>

      {children && <div className="w-full md:w-auto">{children}</div>}
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  showBackButton: PropTypes.bool,
  backButtonLabel: PropTypes.string,
  onBackClick: PropTypes.func,
};

export default PageHeader;
