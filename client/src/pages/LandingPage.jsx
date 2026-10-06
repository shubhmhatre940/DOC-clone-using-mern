import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FileText,
  Users,
  Zap,
  ShieldCheck,
  Download,
  Folder,
  History,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  Lock,
  FileCode,
  Globe
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafd] dark:bg-[#111215] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-[#14161a]/80 border-b border-gray-200/80 dark:border-neutral-800 px-4 md:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                DocFusion
              </span>
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                MERN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-700 transition focus:outline-none cursor-pointer"
              title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 px-4 md:px-8 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6 shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Next-Gen Real-Time Document Collaboration</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
            Create, Edit & Collaborate on Documents <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">In Real Time</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            A modern Google Docs clone built with the MERN stack, Yjs conflict-free real-time sync, TipTap rich text engine, Word (.docx) import/export, and complete dark mode customization.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-xl shadow-blue-500/25 transition cursor-pointer"
            >
              <span>{isAuthenticated ? 'Open Dashboard' : 'Start Creating Free'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-[#1e2024] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-800 font-semibold text-base hover:bg-gray-50 dark:hover:bg-neutral-800 shadow-sm transition cursor-pointer"
              >
                <span>Sign in to Account</span>
              </button>
            )}
          </div>

          {/* Feature Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Real-Time Yjs CRDT Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Word (.docx) & PDF Export</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Granular Permissions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Full Dark Theme Support</span>
            </div>
          </div>
        </div>

        {/* 3. Interactive Hero Document Mockup */}
        <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-gray-200/90 dark:border-neutral-800 bg-white dark:bg-[#1c1e22] shadow-2xl p-4 sm:p-6 transition-colors">
          {/* Simulated Editor Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Project_Proposal_2026.docx</h4>
                <p className="text-[10px] text-gray-400">Saved to Cloud • Edited 2 mins ago</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected
              </span>
              <div className="flex -space-x-1.5">
                <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-semibold flex items-center justify-center border-2 border-white dark:border-[#1c1e22]">
                  AS
                </div>
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center border-2 border-white dark:border-[#1c1e22]">
                  JD
                </div>
              </div>
            </div>
          </div>

          {/* Simulated Toolbar */}
          <div className="flex items-center gap-2 py-2 px-3 bg-[#edf2fa] dark:bg-[#25282e] rounded-xl my-3 text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
            <span className="font-semibold px-2 py-1 bg-white dark:bg-neutral-800 rounded shadow-xs">Normal text</span>
            <span className="font-semibold px-2 py-1 bg-white dark:bg-neutral-800 rounded shadow-xs">Arial</span>
            <span className="px-2 py-1 bg-white dark:bg-neutral-800 rounded shadow-xs font-mono">16px</span>
            <div className="h-4 w-[1px] bg-gray-300 dark:bg-neutral-700"></div>
            <span className="font-bold px-1.5">B</span>
            <span className="italic px-1.5">I</span>
            <span className="underline px-1.5">U</span>
            <div className="h-4 w-[1px] bg-gray-300 dark:bg-neutral-700"></div>
            <span className="px-1 text-blue-600 font-semibold">Color</span>
            <span className="px-1 text-emerald-600 font-semibold">Highlight</span>
          </div>

          {/* Simulated Paper Canvas */}
          <div className="p-6 sm:p-10 bg-[#f8fafd] dark:bg-[#151619] rounded-2xl border border-gray-100 dark:border-neutral-800 min-h-[220px]">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">DocFusion Platform Overview</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Welcome to the real-time collaborative workspace. Multiple authors can co-edit rich text documents simultaneously with instantaneous conflict-free synchronization powered by Yjs CRDT technology.
            </p>
            <blockquote className="border-l-4 border-blue-600 pl-4 py-1 text-sm italic text-gray-600 dark:text-gray-400 bg-blue-50/50 dark:bg-blue-950/30 rounded-r-lg">
              "Effortlessly co-author documents with live collaborator presence, Word import/export, and complete version history."
            </blockquote>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section className="py-16 px-4 md:px-8 bg-white dark:bg-[#141518] border-t border-gray-200/80 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Everything You Need for Enterprise-Grade Docs
            </h2>
            <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
              Packed with features designed for high productivity, real-time collaboration, and multi-format document workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-7 rounded-2xl bg-[#f8fafd] dark:bg-[#1b1c20] border border-gray-200/80 dark:border-neutral-800 transition hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Real-Time Co-Authoring
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Powered by Yjs CRDTs and WebSockets. Experience zero lock-contention, live collaborator awareness avatars, and real-time cursor presence.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-2xl bg-[#f8fafd] dark:bg-[#1b1c20] border border-gray-200/80 dark:border-neutral-800 transition hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Word (.docx) & PDF Export
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Import existing Microsoft Word `.docx` documents effortlessly with Mammoth, and export pixel-perfect PDF and DOCX files anytime.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-2xl bg-[#f8fafd] dark:bg-[#1b1c20] border border-gray-200/80 dark:border-neutral-800 transition hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Version History & Diffs
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Review chronological revisions, inspect auto-saved snapshots, and restore past versions of your document with one click.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-2xl bg-[#f8fafd] dark:bg-[#1b1c20] border border-gray-200/80 dark:border-neutral-800 transition hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <Folder className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Folder Organization & Trash
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Organize documents into custom folders, filter starred items, and soft-delete files to a recoverable trash bin.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-2xl bg-[#f8fafd] dark:bg-[#1b1c20] border border-gray-200/80 dark:border-neutral-800 transition hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Granular Permissions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Assign roles: Owner, Editor, Commenter, and Viewer. Share via email invite or generate public access links.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-2xl bg-[#f8fafd] dark:bg-[#1b1c20] border border-gray-200/80 dark:border-neutral-800 transition hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Complete Dark Mode
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Seamless theme switching across all components, including document canvas typography, toolbars, popups, and dashboard cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto bg-[#f1f3f4] dark:bg-[#0e0f11] border-t border-gray-200/80 dark:border-neutral-800 py-8 px-4 md:px-8 text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              D
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">DocFusion</span>
            <span>• Full-Featured Google Docs MERN Clone</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-gray-800 dark:hover:text-gray-200 transition">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-gray-800 dark:hover:text-gray-200 transition">
              Register
            </Link>
            <a
              href="https://github.com/shubhmhatre940/DOC-clone-using-mern"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-800 dark:hover:text-gray-200 transition"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
