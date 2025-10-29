import React from "react";
import PropTypes from "prop-types";

const ContentCard = ({
  title,
  children,
  footer,
  headerActions,
  noPadding = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}

      <div className={noPadding ? "" : "p-6"}>{children}</div>

      {footer && (
        <div className="px-6 py-4 border-t border-gray-200">{footer}</div>
      )}
    </div>
  );
};

ContentCard.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  headerActions: PropTypes.node,
  noPadding: PropTypes.bool,
};

export default ContentCard;
