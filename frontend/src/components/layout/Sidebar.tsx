import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  LayoutTemplate, 
  Bot, 
  CheckCircle2, 
  Target, 
  Mail, 
  Briefcase, 
  Settings, 
  LogOut, 
  Sparkles,
  ChevronRight,
  Home,
  Files,
  KanbanSquare
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';

interface SidebarProps {
  currentResumeId?: number;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentResumeId, onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onNavigate?.();
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/my-resumes', label: 'My Resumes', icon: Files },
    { 
      to: currentResumeId ? `/editor/${currentResumeId}` : '/editor', 
      label: 'Resume Editor', 
      icon: FileText 
    },
    { to: '/templates', label: 'Templates', icon: LayoutTemplate },
    { to: '/ai-assistant', label: 'AI Assistant', icon: Bot, badge: 'Smart' },
    { to: '/ats-checker', label: 'ATS Checker', icon: CheckCircle2 },
    { to: '/job-matcher', label: 'Job Matching', icon: Target },
    { to: '/cover-letters', label: 'Cover Letters', icon: Mail },
    { to: '/job-tracker', label: 'Job Tracker', icon: KanbanSquare },
    { to: '/career-tools', label: 'Career Tools', icon: Briefcase },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0B1528] text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
        <Link 
          to="/" 
          onClick={onNavigate}
          className="flex items-center gap-2.5 group"
          title="Go to Landing Page"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-white text-base tracking-tight flex items-center gap-1">
              ResuMate <span className="text-indigo-400">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Career Suite
            </span>
          </div>
        </Link>

        {/* Quick Link to Landing Page */}
        <Link
          to="/"
          onClick={onNavigate}
          title="Return to Public Home"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Home className="h-4 w-4" />
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Application Suite
        </div>

        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className="h-3.5 w-3.5 opacity-30" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070D1B]">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
          <Link 
            to="/settings" 
            onClick={onNavigate}
            className="flex items-center gap-2.5 min-w-0 flex-1"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-semibold text-white truncate">
                {user?.full_name || 'My Account'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || 'Manage profile'}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors flex-shrink-0 ml-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
