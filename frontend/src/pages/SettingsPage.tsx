import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Palette, 
  Download, 
  Trash2, 
  Check, 
  ShieldAlert, 
  Sun, 
  Moon,
  LayoutTemplate
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Modal } from '../components/common/Modal';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [defaultTemplate, setDefaultTemplate] = useState(user?.default_template || 'ats_classic');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg('New passwords do not match.');
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg('');
    try {
      await api.changePassword({ old_password: oldPassword, new_password: newPassword });
      setPasswordMsg('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg(err.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportAccountData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resumate_account_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (err) {
      alert('Failed to export account data: ' + err);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    try {
      await api.deleteAccount();
      logout();
      navigate('/');
    } catch (err) {
      alert('Failed to delete account: ' + err);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, password, appearance themes, and career data backups.
        </p>
      </div>

      {/* 1. Profile Information */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <User className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Profile Information
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
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Email
              </label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Template
              </label>
              <select
                value={defaultTemplate}
                onChange={(e) => setDefaultTemplate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="ats_classic">ATS Classic (Recommended)</option>
                <option value="modern_pro">Modern Professional</option>
                <option value="software_dev">Software Developer</option>
                <option value="student_fresher">Student / Fresher</option>
                <option value="minimalist">Minimalist</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {profileSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
            {profileSuccess && (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 2. Theme & Appearance */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Palette className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Appearance & Resume Styling
          </h2>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            System Theme
          </label>
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold transition-all ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold transition-all ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Font Family
            </label>
            <select
              defaultValue="Inter"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Inter">Inter (Clean Sans)</option>
              <option value="Merriweather">Merriweather (Classic Serif)</option>
              <option value="JetBrains Mono">JetBrains (Technical Mono)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Font Size
            </label>
            <select
              defaultValue="medium"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="small">Small (High Density)</option>
              <option value="medium">Medium (Standard)</option>
              <option value="large">Large (High Legibility)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Line Spacing
            </label>
            <select
              defaultValue="normal"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="compact">Compact (Fit to 1 Page)</option>
              <option value="normal">Normal (Standard)</option>
              <option value="relaxed">Relaxed (Breathable)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Password & Security */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Lock className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Security & Password
          </h2>
        </div>

        <form onSubmit={handleSavePassword} className="space-y-3.5 text-xs max-w-md">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password (min. 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          {passwordMsg && (
            <p className="text-xs font-semibold text-indigo-600">{passwordMsg}</p>
          )}

          <button
            type="submit"
            disabled={passwordSaving}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-all"
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* 4. Data Export & Account Destruction */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Data Management & Privacy
        </h2>

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

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
          <div>
            <h3 className="font-bold text-rose-700 dark:text-rose-300">Delete Account</h3>
            <p className="text-rose-600/80 dark:text-rose-400/80">Permanently remove your account, career data, and saved resumes. This cannot be undone.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Permanently Delete Account?"
        subtitle="This action will delete all your resumes, cover letters, and job application history."
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Are you absolutely certain? All data associated with <strong>{user?.email}</strong> will be permanently wiped from the database.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccountConfirm}
              className="px-4 py-1.5 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700"
            >
              Yes, Delete Permanently
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

