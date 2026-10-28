import React, { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, Menu, X, Plus, Sparkles, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCreatingResume, setIsCreatingResume] = useState(false);

  // Extract active resume ID from URL if on editor/preview route
  const matchEditor = location.pathname.match(/\/(editor|preview|export)\/(\d+)/);
  const activeResumeId = matchEditor ? parseInt(matchEditor[2], 10) : undefined;

  const handleCreateNewResume = async () => {
    setIsCreatingResume(true);
    try {
      const newResume = await api.createResume({
        title: 'Professional Resume',
        template_id: user?.default_template || 'ats_classic',
        theme_color: '#4F46E5',
      });
      navigate(`/editor/${newResume.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to initialize resume: ' + err);
    } finally {
      setIsCreatingResume(false);
    }
  };

  // Human friendly page title
  const getPageTitle = () => {
    const p = location.pathname;
    if (p.startsWith('/dashboard')) return 'Dashboard Overview';
    if (p.startsWith('/editor')) return 'Resume Builder & Editor';
    if (p.startsWith('/preview') || p.startsWith('/export')) return 'Resume Preview & Export';
    if (p.startsWith('/templates')) return 'Template Gallery';
    if (p.startsWith('/ai-assistant')) return 'AI Assistant & Copilot';
    if (p.startsWith('/ats-checker')) return 'ATS Readiness Scanner';
    if (p.startsWith('/job-matcher')) return 'Job Description Matcher';
    if (p.startsWith('/cover-letters')) return 'Cover Letter Studio';
    if (p.startsWith('/career-tools')) return 'Career Tracker & Toolkit';
    if (p.startsWith('/settings')) return 'Preferences & Account';
    return 'ResuMate AI';
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* Desktop Navy Sidebar */}
      <div className="hidden lg:block">
        <Sidebar currentResumeId={activeResumeId} />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0B1528] z-50">
            <div className="absolute top-2 right-2">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <Sidebar 
              currentResumeId={activeResumeId} 
              onNavigate={() => setMobileSidebarOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-10 transition-colors">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {getPageTitle()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Create Resume Quick Button */}
            <button
              type="button"
              disabled={isCreatingResume}
              onClick={handleCreateNewResume}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Resume</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Toggle Light / Dark mode"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

