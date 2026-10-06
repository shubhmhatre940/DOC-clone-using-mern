import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FileText, AlertCircle, ArrowRight, Sun, Moon } from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signup, error, clearError } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    const result = await signup(name, email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  const displayedError = localError || error;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f8fafd] dark:bg-[#121316] px-4 py-12 transition-colors duration-200">
      {/* Top Floating Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-full bg-white dark:bg-[#1e2024] text-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 transition focus:outline-none cursor-pointer"
        title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </button>

      <div className="w-full max-w-[440px] rounded-2xl bg-white dark:bg-[#1c1e22] p-8 sm:p-10 shadow-xl border border-gray-200/80 dark:border-neutral-800 transition-colors">
        {/* Google Docs Icon Branding */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">DocFusion</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Google Docs Clone</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Create Account</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Get started with your free account</p>

        {displayedError && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3.5 text-sm text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{displayedError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                clearError();
                setLocalError('');
                setName(e.target.value);
              }}
              placeholder="Alex Smith"
              className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-[#25282e] px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                clearError();
                setLocalError('');
                setEmail(e.target.value);
              }}
              placeholder="alex@example.com"
              className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-[#25282e] px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  clearError();
                  setLocalError('');
                  setPassword(e.target.value);
                }}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-[#25282e] px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Confirm
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  clearError();
                  setLocalError('');
                  setConfirmPassword(e.target.value);
                }}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-[#25282e] px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
            Use 6 or more characters with a mix of letters and numbers.
          </p>

          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60 transition shadow-sm cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Already registered?</span>
          <Link
            to="/login"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
