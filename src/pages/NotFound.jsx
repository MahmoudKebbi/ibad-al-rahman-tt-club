import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="text-2xl text-gray-800 mt-4">Page not found</p>
      <p className="text-gray-700 mt-2">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/login" className="mt-8 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;