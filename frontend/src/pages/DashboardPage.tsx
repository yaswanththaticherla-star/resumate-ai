import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Files, 
  FileText, 
  Bot, 
  CheckCircle2, 
  Target, 
  Mail, 
  ArrowRight, 
  Eye, 
  Edit3, 
  Sparkles,
  Calendar,
  Briefcase,
  TrendingUp,
  LayoutTemplate,
  KanbanSquare
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { api } from '../services/api';
import { Resume } from '../types';
import { ScoreGauge } from '../components/common/ScoreGauge';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLettersCount, setCoverLettersCount] = useState<number>(0);
  const [applicationsCount, setApplicationsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isCreatingResume, setIsCreatingResume] = useState(false);

  useEffect(() => {
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
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  const avgScore = resumes.length
    ? Math.round(resumes.reduce((sum, r) => sum + (r.ats_score || 0), 0) / resumes.length)
    : 0;

  // Recent resumes: top 4 sorted by updated date
  const recentResumes = [...resumes]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* 1. Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">👋</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.full_name ? user.full_name.split(' ')[0] : 'there'}!
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user?.email} • {user?.headline || 'Professional'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/my-resumes"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all"
          >
            <Files className="w-4 h-4 text-indigo-500" />
            <span>My Resumes ({resumes.length})</span>
          </Link>

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

      {/* 2. Resume Statistics & Activity Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Resumes */}
        <Link
          to="/my-resumes"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Resumes
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Files className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {resumes.length}
            </div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1 flex items-center gap-1">
              <span>Manage in My Resumes</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Stat 2: Average ATS Score */}
        <Link
          to="/ats-checker"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-sm transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Avg. ATS Score
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {resumes.length > 0 ? `${avgScore}%` : 'N/A'}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <span>Scan ATS Readiness</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Stat 3: Cover Letters Drafted */}
        <Link
          to="/cover-letters"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400 dark:hover:border-sky-600 shadow-sm transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Cover Letters
            </span>
            <div className="h-8 w-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {coverLettersCount}
            </div>
            <div className="text-[11px] text-sky-600 dark:text-sky-400 font-medium mt-1 flex items-center gap-1">
              <span>Open Studio</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Stat 4: Applications Tracked */}
        <Link
          to="/job-tracker"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-400 dark:hover:border-purple-600 shadow-sm transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Applications
            </span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <KanbanSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {applicationsCount}
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1 flex items-center gap-1">
              <span>Track Pipeline</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Recently Created or Edited Resumes (Limited to recent items, with link to My Resumes) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Resumes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quick access to your latest working drafts
            </p>
          </div>

          <Link
            to="/my-resumes"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <span>View All ({resumes.length}) in My Resumes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading recent activity...</div>
        ) : recentResumes.length === 0 ? (
          <div className="py-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-6 border border-dashed border-slate-200 dark:border-slate-700">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No resumes found</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create your first resume to start optimizing for applicant tracking systems.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateResume}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm"
            >
              + Create New Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentResumes.map((resume) => (
              <div
                key={resume.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: resume.theme_color || '#4F46E5' }}
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      {resume.template_id.replace('_', ' ')}
                    </span>
                  </div>

                  <Link
                    to={`/editor/${resume.id}`}
                    className="block mt-2 font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1"
                  >
                    {resume.title}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {resume.target_role || 'General Role'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <ScoreGauge score={resume.ats_score} size="sm" label="" />
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/editor/${resume.id}`}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:text-indigo-600 transition-colors"
                      title="Edit Resume"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to={`/preview/${resume.id}`}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:text-indigo-600 transition-colors"
                      title="Preview Resume"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Quick Feature Navigation Cards Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Quick Tools & Navigation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access our integrated suite of AI and career acceleration utilities
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card: My Resumes */}
          <Link
            to="/my-resumes"
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <Files className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                {resumes.length} Saved
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                <span>My Resumes Library</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                View your complete collection of resumes, duplicate drafts, and export DOCX files.
              </p>
            </div>
          </Link>

          {/* Card: AI Assistant */}
          <Link
            to="/ai-assistant"
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <Bot className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                Groq + Gemini
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                <span>AI Assistant & Copilot</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Improve summary sections, enhance XYZ bullet points, and generate LinkedIn headlines.
              </p>
            </div>
          </Link>

          {/* Card: ATS Scanner */}
          <Link
            to="/ats-checker"
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                Score Audit
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                <span>ATS Readiness Scanner</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Verify contact info, quantifiable metrics, section headers, and formatting health.
              </p>
            </div>
          </Link>

          {/* Card: Job Description Matcher */}
          <Link
            to="/job-matcher"
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 px-2 py-0.5 rounded-full">
                Keywords
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors flex items-center gap-1">
                <span>Job Description Matcher</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Paste any target job description to pinpoint matching and missing critical keywords.
              </p>
            </div>
          </Link>

          {/* Card: Cover Letter Studio */}
          <Link
            to="/cover-letters"
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500 shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
                <Mail className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 px-2 py-0.5 rounded-full">
                Custom Drafts
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors flex items-center gap-1">
                <span>Cover Letter Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Create tailored letters aligned with employer values and role requirements.
              </p>
            </div>
          </Link>

          {/* Card: Template Gallery */}
          <Link
            to="/templates"
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <LayoutTemplate className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 px-2 py-0.5 rounded-full">
                ATS Tested
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors flex items-center gap-1">
                <span>Template Gallery</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Switch layout designs freely between ATS Classic, Modern Pro, Executive, and Fresher.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
