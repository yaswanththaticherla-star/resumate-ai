import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Sun, Moon, Menu, X, FileText, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              ResuMate<span className="text-indigo-600 dark:text-indigo-400"> AI</span>
            </span>
            <span className="text-[10px] -mt-1 font-medium tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Smart Resume Builder
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link to="/my-resumes" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            My Resumes
          </Link>
          <Link to="/templates" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Templates
          </Link>
          <Link to="/career-tools" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Career Tools
          </Link>
          <Link to="/settings" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Settings
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Workspace profile button and dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 pr-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'A'}
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate">{user?.full_name ? user.full_name.split(' ')[0] : 'Alex'}</span>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Workspace User</p>
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.full_name || 'Alex Morgan'}</p>
                  <p className="truncate text-[11px] text-slate-400">{user?.email || 'alex.morgan@example.com'}</p>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <LayoutDashboard className="h-4 w-4 text-slate-400" />
                  Dashboard
                </Link>
                <Link
                  to="/my-resumes"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <FileText className="h-4 w-4 text-slate-400" />
                  My Resumes
                </Link>
                <Link
                  to="/templates"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <FileText className="h-4 w-4 text-slate-400" />
                  Template Gallery
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  Workspace Settings
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/30">
              Dashboard
            </Link>
            <Link to="/my-resumes" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              My Resumes
            </Link>
            <Link to="/templates" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              Templates
            </Link>
            <Link to="/career-tools" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              Career Tools
            </Link>
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              Settings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
