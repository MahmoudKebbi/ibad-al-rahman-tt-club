import React from 'react';
import PropTypes from 'prop-types';

const SearchAndFilter = ({ 
  searchTerm, 
  onSearchChange, 
  filterOptions,
  filterValue,
  onFilterChange,
  placeholder = 'Search...'
}) => {
  return (
    <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <svg 
          className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {/* Filter Dropdown - only render if filterOptions are provided */}
      {filterOptions && (
        <select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {filterOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

SearchAndFilter.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  filterOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  filterValue: PropTypes.string,
  onFilterChange: PropTypes.func,
  placeholder: PropTypes.string
};

export default SearchAndFilter;