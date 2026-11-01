import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileText, 
  MoreVertical, 
  Copy, 
  Trash2, 
  Download, 
  Eye, 
  Edit3, 
  LayoutTemplate,
  Calendar,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { api } from '../services/api';
import { Resume } from '../types';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { Modal } from '../components/common/Modal';
import { BackButton } from '../components/common/BackButton';

export const MyResumesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'score'>('updated');
  const [isCreatingResume, setIsCreatingResume] = useState(false);

  // Modals
  const [renameTarget, setRenameTarget] = useState<Resume | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const list = await api.listResumes();
      setResumes(list);
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleCreateResume = async () => {
    try {
      setIsCreatingResume(true);
      const newResume = await api.createResume({
        title: 'Professional Resume',
        template_id: user?.default_template || 'ats_classic',
        theme_color: '#4F46E5',
      });
      navigate(`/editor/${newResume.id}`);
    } catch (err) {
      alert('Error creating resume: ' + err);
    } finally {
      setIsCreatingResume(false);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await api.duplicateResume(id);
      await fetchResumes();
      setActionMenuOpen(null);
    } catch (err) {
      alert('Failed to duplicate resume: ' + err);
    }
  };

  const handleRenameConfirm = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    try {
      await api.updateResume(renameTarget.id, { title: renameValue.trim() });
      setRenameTarget(null);
      await fetchResumes();
    } catch (err) {
      alert('Failed to rename resume: ' + err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteResume(deleteTarget.id);
      setDeleteTarget(null);
      await fetchResumes();
    } catch (err) {
      alert('Failed to delete resume: ' + err);
    }
  };

  const handleDirectDownload = (resume: Resume) => {
    window.open(api.exportDocxUrl(resume.id), '_blank');
  };

  // Filter & sort logic
  const filteredResumes = resumes
    .filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.target_role || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTemplate = templateFilter === 'all' || r.template_id === templateFilter;
      return matchesSearch && matchesTemplate;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'score') return b.ats_score - a.ats_score;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Header with Back Button and Create Resume Button */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BackButton to="/dashboard" label="Back to Dashboard" />
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              {resumes.length} {resumes.length === 1 ? 'Resume' : 'Resumes'} Saved
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Resumes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View, edit, duplicate, download, and organize all your saved resume versions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isCreatingResume}
            onClick={handleCreateResume}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Resume</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by resume title or target role..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Template Filter and Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={templateFilter}
            onChange={(e) => setTemplateFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Templates</option>
            <option value="ats_classic">ATS Classic</option>
            <option value="modern_pro">Modern Pro</option>
            <option value="software_dev">Software Dev</option>
            <option value="student_fresher">Student / Fresher</option>
            <option value="minimalist">Minimalist</option>
            <option value="executive">Executive</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="updated">Sort by: Recently Updated</option>
            <option value="title">Sort by: Title (A-Z)</option>
            <option value="score">Sort by: ATS Score (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Resumes Content List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading your resumes...</div>
        ) : filteredResumes.length === 0 ? (
          <div className="p-16 text-center space-y-4 max-w-md mx-auto">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {searchQuery || templateFilter !== 'all' ? 'No matching resumes found' : 'No resumes created yet'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {searchQuery || templateFilter !== 'all'
                  ? 'Try clearing your search query or selecting a different template filter.'
                  : 'Create your first resume or explore our ATS-ready professional templates.'}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCreateResume}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
              >
                + Create New Resume
              </button>
              <Link
                to="/templates"
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                Browse Templates
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 font-semibold">
                  <th className="py-3.5 px-4">Resume Title & Target Role</th>
                  <th className="py-3.5 px-4">Template</th>
                  <th className="py-3.5 px-4">ATS Score</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredResumes.map((resume) => (
                  <tr
                    key={resume.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Title & Target Role */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: resume.theme_color || '#4F46E5' }}
                        />
                        <div>
                          <Link
                            to={`/editor/${resume.id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-xs sm:text-sm flex items-center gap-1.5"
                          >
                            <span>{resume.title}</span>
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-slate-400" />
                              {resume.target_role || 'General Role'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Template */}
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2.5 py-0.5 rounded-full font-medium text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {resume.template_id.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <ScoreGauge score={resume.ats_score} size="sm" label="" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {resume.ats_score}/100
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(resume.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/editor/${resume.id}`}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                          title="Edit Resume"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/preview/${resume.id}`}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors"
                          title="Preview & Export"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDirectDownload(resume)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors"
                          title="Download DOCX"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(resume.id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors"
                          title="Duplicate Resume"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRenameTarget(resume);
                            setRenameValue(resume.title);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors"
                          title="Rename"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(resume)}
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition-colors"
                          title="Delete Resume"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rename Modal */}
      {renameTarget && (
        <Modal
          isOpen={!!renameTarget}
          onClose={() => setRenameTarget(null)}
          title="Rename Resume"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resume Title
              </label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRenameConfirm}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Resume"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Are you sure you want to delete this resume?</p>
                <p className="mt-0.5 text-red-600/90 dark:text-red-300/80">
                  "{deleteTarget.title}" will be permanently removed. Associated cover letters and applications will be preserved.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                Delete Resume
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
