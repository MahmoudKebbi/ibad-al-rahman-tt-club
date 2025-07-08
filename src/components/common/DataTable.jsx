import React from 'react';

const DataTable = ({ 
  columns, 
  data, 
  isLoading, 
  emptyMessage = 'No data available',
  footerContent
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Loading State */}
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Loading data...</p>
                </td>
              </tr>
            ) : data.length > 0 ? (
              /* Data Rows */
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      className="px-6 py-4 whitespace-nowrap"
                    >
                      {/* Use custom render function if provided, otherwise show raw data */}
                      {column.render ? column.render(row) : row[column.field]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              /* Empty State */
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Optional Footer */}
      {footerContent && (
        <div className="px-6 py-4 border-t border-gray-200">
          {footerContent}
        </div>
      )}
    </div>
  );
};

export default DataTable;