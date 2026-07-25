import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="max-w-md mx-auto px-4 py-24 text-center">
    <h1 className="text-6xl font-extrabold text-brand-600">404</h1>
    <p className="text-gray-500 mt-4 mb-8">The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn-primary">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
