import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Palette, 
  Download, 
  Check, 
  Save, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { BackButton } from '../components/common/BackButton';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [defaultTemplate, setDefaultTemplate] = useState(user?.default_template || 'ats_classic');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  React.useEffect(() => {
    if (user) {
      if (user.full_name) setFullName(user.full_name);
      if (user.headline) setHeadline(user.headline);
      if (user.default_template) setDefaultTemplate(user.default_template);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);
    try {
      const updated = await api.updateProfile({
        full_name: fullName,
        headline: headline,
        default_template: defaultTemplate,
      });
      updateUser(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update profile: ' + err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportAccountData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resumate_workspace_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (err) {
      alert('Failed to export workspace data: ' + err);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div className="space-y-2">
        <div>
          <BackButton to="/dashboard" label="Back to Dashboard" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Workspace Settings</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              Local Workspace
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your personal details, appearance themes, and career data backups.
          </p>
        </div>
      </div>

      {/* 1. Profile Information */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <UserIcon className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Workspace Profile
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. yaswanth"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Professional Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Full-Stack Software Engineer"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'alex.morgan@resumate.ai'}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Resume Template
              </label>
              <select
                value={defaultTemplate}
                onChange={(e) => setDefaultTemplate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="ats_classic">ATS Classic (Clean Single-Column)</option>
                <option value="modern_minimalist">Modern Minimalist (High-Impact)</option>
                <option value="executive_split">Executive Split (Leadership)</option>
                <option value="tech_compact">Tech Compact (Dense Engineering)</option>
                <option value="creative_bold">Creative Bold (Design / Product)</option>
                <option value="academic_pro">Academic Pro (Research & Grants)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{profileSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
            {profileSuccess && (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                Profile updated successfully!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 2. Appearance & Display Preferences */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Palette className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Appearance & Workspace Themes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border text-xs font-semibold gap-2 transition-all ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="w-full h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold">
              Light
            </div>
            <span>Clean Day Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border text-xs font-semibold gap-2 transition-all ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="w-full h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold">
              Dark
            </div>
            <span>High-Contrast Slate</span>
          </button>
        </div>
      </div>

      {/* 3. Data Export & Backup */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Download className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Workspace Data & Backup
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Export All Career Data</h3>
            <p className="text-slate-500">Download a complete structured JSON archive of all your resumes, cover letters, and tracked applications.</p>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
