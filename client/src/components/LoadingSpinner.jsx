import React from 'react';

const LoadingSpinner = ({ full = false }) => (
  <div className={`flex items-center justify-center ${full ? 'min-h-[60vh]' : 'py-10'}`}>
    <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
  </div>
);

export default LoadingSpinner;
