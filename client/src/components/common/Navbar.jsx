import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Menu,
  Search,
  X,
  LogOut,
  User,
  FileText,
  Sun,
  Moon
} from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 dark:border-[#2e2f33] bg-white dark:bg-[#1e1f20] px-4 md:px-6 transition-colors">
      {/* Left: Hamburger & Google Docs Branding */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition focus:outline-none"
          title="Main menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-9 h-10 bg-[#2684fc] rounded flex items-center justify-center text-white shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <span className="text-xl font-medium tracking-tight text-gray-700 dark:text-gray-200 hidden sm:inline">
            Docs
          </span>
        </div>
      </div>

      {/* Middle: Google Docs Search Bar */}
      <div className="flex-1 max-w-2xl px-4">
        <div className="relative flex items-center w-full">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full h-11 pl-11 pr-10 rounded-full bg-[#f1f3f4] dark:bg-[#2a2b2e] text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-transparent hover:bg-[#e8eaed] dark:hover:bg-[#333538] hover:shadow-xs focus:bg-white dark:focus:bg-[#1e1f20] focus:border-gray-200 dark:focus:border-neutral-700 focus:shadow-md focus:outline-none transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Theme Toggle, Notifications & User Avatar Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition focus:outline-none cursor-pointer"
          title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400 animate-in spin-in-90 duration-200" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 transition" />
          )}
        </button>

        <NotificationBell />

        <div className="relative flex items-center" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-700 text-white font-medium text-sm hover:ring-4 hover:ring-purple-100 dark:hover:ring-purple-950 focus:outline-none transition"
            title={`Google Account: ${user?.name || 'User'}`}
          >
            {getInitials(user?.name)}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-72 rounded-2xl bg-white dark:bg-[#2a2b2e] p-4 shadow-xl border border-gray-100 dark:border-[#383a3d] z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex flex-col items-center pb-4 border-b border-gray-100 dark:border-[#383a3d] text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-700 text-white font-semibold text-lg mb-2 shadow-inner">
                  {getInitials(user?.name)}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{user?.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
