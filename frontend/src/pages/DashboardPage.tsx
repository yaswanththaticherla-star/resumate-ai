import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  FileText, 
  Bot, 
  CheckCircle2, 
  Target, 
  Mail, 
  Copy, 
  Trash2, 
  Download, 
  Eye, 
  Edit3, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { api } from '../services/api';
import { Resume } from '../types';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { Modal } from '../components/common/Modal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLettersCount, setCoverLettersCount] = useState<number>(0);
  const [applicationsCount, setApplicationsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'score'>('updated');

  // Modals
  const [renameTarget, setRenameTarget] = useState<Resume | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resList, clList, appList] = await Promise.all([
        api.listResumes(),
        api.listCoverLetters().catch(() => []),
        api.listJobApplications().catch(() => []),
      ]);
      setResumes(resList);
      setCoverLettersCount(clList.length);
      setApplicationsCount(appList.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateResume = async () => {
    try {
      const newResume = await api.createResume({
        title: 'New Resume',
        template_id: user?.default_template || 'ats_classic',
        theme_color: '#4F46E5',
      });
      navigate(`/editor/${newResume.id}`);
    } catch (err) {
      alert('Error creating resume: ' + err);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await api.duplicateResume(id);
      fetchDashboardData();
      setActionMenuOpen(null);
    } catch (err) {
      alert('Failed to duplicate: ' + err);
    }
  };

  const handleRenameConfirm = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    try {
      await api.updateResume(renameTarget.id, { title: renameValue.trim() });
      setRenameTarget(null);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to rename: ' + err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteResume(deleteTarget.id);
      setDeleteTarget(null);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to delete: ' + err);
    }
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

  const avgScore = resumes.length
    ? Math.round(resumes.reduce((sum, r) => sum + (r.ats_score || 0), 0) / resumes.length)
    : 0;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.full_name ? user.full_name.split(' ')[0] : 'there'}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your resumes, optimize ATS scores, and tailor applications for target job roles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateResume}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Resume</span>
        </button>
      </div>

      {/* Feature Navigation Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: AI Assistant */}
        <Link
          to="/ai-assistant"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm transition-all group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 px-2 py-0.5 rounded-full">
              AI Copilot
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
              AI Assistant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Improve summary, enhance bullet points, and fix spelling with one click.
            </p>
          </div>
        </Link>

        {/* Card 2: ATS Checker */}
        <Link
          to="/ats-checker"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-sm transition-all group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 px-2 py-0.5 rounded-full">
              {resumes.length > 0 ? `${avgScore}% Avg` : 'No Audits'}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
              ATS Checker
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Audit contact details, metrics, and heading structure against ATS standards.
            </p>
          </div>
        </Link>

        {/* Card 3: Job Description Matcher */}
        <Link
          to="/job-matcher"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-400 dark:hover:border-purple-600 shadow-sm transition-all group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <Target className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 px-2 py-0.5 rounded-full">
              {applicationsCount > 0 ? `${applicationsCount} Applied` : 'Matcher'}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
              Job Matcher
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Compare your resume against any job posting to uncover missing skills.
            </p>
          </div>
        </Link>

        {/* Card 4: Cover Letter Builder */}
        <Link
          to="/cover-letters"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400 dark:hover:border-sky-600 shadow-sm transition-all group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
              <Mail className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 px-2 py-0.5 rounded-full">
              {coverLettersCount > 0 ? `${coverLettersCount} Draft${coverLettersCount === 1 ? '' : 's'}` : 'Studio'}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">
              Cover Letters
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Draft professional, tailored letters matching company mission and role.
            </p>
          </div>
        </Link>
      </div>

      {/* Resumes Management Table Section */}
      <div id="my-resumes" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Header Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              My Resumes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filteredResumes.length} document{filteredResumes.length === 1 ? '' : 's'} found
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resumes..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Template Filter */}
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Templates</option>
              <option value="ats_classic">ATS Classic</option>
              <option value="modern_pro">Modern Pro</option>
              <option value="software_dev">Software Dev</option>
              <option value="student_fresher">Student / Fresher</option>
              <option value="minimalist">Minimalist</option>
              <option value="executive">Executive</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="updated">Recently Updated</option>
              <option value="title">Title (A-Z)</option>
              <option value="score">ATS Score</option>
            </select>
          </div>
        </div>

        {/* Resumes Table */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading resumes...</div>
        ) : filteredResumes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {searchQuery || templateFilter !== 'all' ? 'No resumes match your filter.' : 'No resumes created yet.'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || templateFilter !== 'all'
                ? 'Try clearing your search query or selecting another template filter.'
                : 'Create your first professional resume or browse our ATS-optimized templates to get started.'}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCreateResume}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
              >
                + Create New Resume
              </button>
              <Link
                to="/templates"
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
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
                  <th className="py-3 px-4">Resume Title</th>
                  <th className="py-3 px-4">Template</th>
                  <th className="py-3 px-4">ATS Score</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredResumes.map((resume) => (
                  <tr
                    key={resume.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <Link
                        to={`/editor/${resume.id}`}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <span>{resume.title}</span>
                      </Link>
                      {resume.target_role && (
                        <span className="text-[10px] text-slate-400 block ml-6">
                          Target: {resume.target_role}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 capitalize">
                        {resume.template_id.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          resume.ats_score >= 85
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : resume.ats_score >= 70
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                        }`}
                      >
                        {resume.ats_score}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(resume.updated_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/editor/${resume.id}`}
                          title="Edit Resume"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/preview/${resume.id}`}
                          title="Preview & Export"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => window.open(api.exportDocxUrl(resume.id), '_blank')}
                          title="Download DOCX"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(resume.id)}
                          title="Duplicate Resume"
                          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRenameTarget(resume);
                            setRenameValue(resume.title);
                          }}
                          title="Rename"
                          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(resume)}
                          title="Delete Resume"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
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
      <Modal
        isOpen={renameTarget !== null}
        onClose={() => setRenameTarget(null)}
        title="Rename Resume"
        subtitle="Give your resume a clear descriptive title for target roles."
      >
        <div className="space-y-4">
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer Resume"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRenameTarget(null)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRenameConfirm}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
            >
              Save Title
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Resume?"
        subtitle="Are you sure you want to delete this resume? This action cannot be undone."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            You are about to permanently delete "<strong>{deleteTarget?.title}</strong>".
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

