import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-white border-t border-gray-200 mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
      <div>
        <span className="text-xl font-extrabold text-brand-600">Ink<span className="text-gray-900">Well</span></span>
        <p className="text-sm text-gray-500 mt-2">A modern space to write, share, and discover ideas.</p>
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Explore</h4>
        <ul className="space-y-1 text-sm text-gray-500">
          <li><Link to="/" className="hover:text-brand-600">Home</Link></li>
          <li><Link to="/categories" className="hover:text-brand-600">Categories</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Account</h4>
        <ul className="space-y-1 text-sm text-gray-500">
          <li><Link to="/login" className="hover:text-brand-600">Login</Link></li>
          <li><Link to="/register" className="hover:text-brand-600">Sign up</Link></li>
        </ul>
      </div>
    </div>
    <div className="text-center text-xs text-gray-400 pb-6">© {new Date().getFullYear()} InkWell. Built with the MERN stack.</div>
  </footer>
);

export default Footer;
