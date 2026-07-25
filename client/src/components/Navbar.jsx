import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api, { fileUrl } from '../api/axios.js';
import NotificationBell from './NotificationBell.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-extrabold text-brand-600">Ink<span className="text-gray-900">Well</span></span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search posts..."
              className="input"
            />
          </form>

          <nav className="flex items-center gap-3">
            <Link to="/" className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-brand-600">
              Home
            </Link>
            <Link to="/categories" className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-brand-600">
              Categories
            </Link>

            {user ? (
              <>
                <Link to="/create-post" className="btn-primary text-sm py-1.5">
                  Write
                </Link>
                <NotificationBell />
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center overflow-hidden border border-brand-200"
                  >
                    {user.avatar ? (
                      <img src={fileUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.[0]?.toUpperCase()
                    )}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to={`/author/${user.username}`}
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                          navigate('/');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm py-1.5">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
