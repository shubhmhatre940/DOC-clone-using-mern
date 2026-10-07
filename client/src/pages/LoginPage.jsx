import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FileText,
  AlertCircle,
  ArrowRight,
  Sun,
  Moon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Users2,
  Zap,
  Check
} from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login, error, clearError } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-[#121316] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Left Panel: Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative z-10">
        {/* Top Navbar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FileText className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                DocFusion
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1e2024] text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200/80 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800 transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
            title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {isDark ? (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-slate-600" />
            )}
          </button>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Sign in to your DocFusion account to access your workspace.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 animate-in fade-in">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    clearError();
                    setEmail(e.target.value);
                  }}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-[#1e2024] pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition shadow-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Please contact your workspace administrator to reset your password.');
                  }}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    clearError();
                    setPassword(e.target.value);
                  }}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-[#1e2024] pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me Checkbox */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500/30"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">Remember me on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60 transition shadow-sm cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Create Account Link */}
          <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 ml-1"
            >
              Create account
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-600">
          &copy; {new Date().getFullYear()} DocFusion Workspace Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Branded Product Showcase (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Background decorative glowing circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-200/80">
          <Sparkles className="w-4 h-4 text-blue-300" />
          <span>Real-time Collaborative Editor</span>
        </div>

        {/* Center Graphic Preview Mockup */}
        <div className="relative z-10 my-auto py-8">
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-lg mb-4">
            Write, collaborate, ship faster.
          </h2>
          <p className="text-sm text-blue-100/80 max-w-md leading-relaxed mb-8">
            Experience seamless multi-user document editing, AI-powered writing assistance, and effortless team document workflows.
          </p>

          {/* Interactive Document Preview Mockup */}
          <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
                <span className="text-xs text-white/70 font-medium ml-2">Project Proposal 2026.docx</span>
              </div>
              <div className="flex -space-x-1">
                <div className="w-6 h-6 rounded-full bg-purple-500 border border-white/40 flex items-center justify-center text-[10px] font-bold">JD</div>
                <div className="w-6 h-6 rounded-full bg-blue-500 border border-white/40 flex items-center justify-center text-[10px] font-bold">AS</div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-white/80">
              <div className="h-3 bg-white/20 rounded w-3/4"></div>
              <div className="h-2.5 bg-white/15 rounded w-full"></div>
              <div className="h-2.5 bg-white/15 rounded w-5/6"></div>
            </div>

            <div className="flex items-center gap-3 pt-2 text-[11px] text-blue-200">
              <div className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auto-saved</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Gemini AI Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 flex items-center gap-6 text-xs text-blue-200/90 font-medium">
          <div className="flex items-center gap-1.5">
            <Users2 className="w-4 h-4 text-blue-300" />
            <span>Multi-user Yjs Sync</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>Gemini 3.1 AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
