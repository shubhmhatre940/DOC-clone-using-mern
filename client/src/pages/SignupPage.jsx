import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, AlertCircle, ArrowRight } from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signup, error, clearError } = useAuth();
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
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4f9] px-4 py-12">
      <div className="w-full max-w-[460px] rounded-3xl bg-white p-8 sm:p-10 shadow-sm border border-gray-200">
        {/* Google Docs Icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Google Docs</h1>
            <p className="text-xs text-gray-500 font-medium">MERN Edition</p>
          </div>
        </div>

        <h2 className="text-2xl font-normal text-gray-800 mb-2">Create your Account</h2>
        <p className="text-sm text-gray-600 mb-6">to get started with Google Docs</p>

        {displayedError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{displayedError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
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
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
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
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
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
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
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
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 pt-1">
            Use 6 or more characters with a mix of letters and numbers.
          </p>

          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1a73e8] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1557b0] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 transition shadow-sm"
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

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-gray-600">Already have an account?</span>
          <Link
            to="/login"
            className="font-medium text-[#1a73e8] hover:text-[#1557b0] hover:underline"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
