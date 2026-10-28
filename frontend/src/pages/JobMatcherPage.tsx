import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  History, 
  Lightbulb, 
  FolderGit2,
  Check,
  Building2
} from 'lucide-react';
import { api } from '../services/api';
import { Resume, JobMatchResult } from '../types';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { BackButton } from '../components/common/BackButton';

export const JobMatcherPage: React.FC = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const [resList, histList] = await Promise.all([
          api.listResumes().catch(() => []),
          api.getJobMatchHistory().catch(() => []),
        ]);
        setResumes(resList);
        setHistory(histList);
        if (resList.length > 0) {
          setSelectedResumeId(resList[0].id);
          if (resList[0].target_role) {
            setJobTitle(resList[0].target_role);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedResumeId || !jobDescription.trim()) {
      alert('Please select a resume and paste a job description.');
      return;
    }
    setLoading(true);
    try {
      const matchRes = await api.analyzeJobMatch({
        resume_id: selectedResumeId,
        job_title: jobTitle,
        company: company,
        job_description: jobDescription,
      });
      setResult(matchRes);
      // Refresh history
      const updatedHist = await api.getJobMatchHistory();
      setHistory(updatedHist);
    } catch (err) {
      alert('Analysis failed: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMissingSkills = async () => {
    if (!selectedResumeId || !result || result.missing_skills.length === 0) return;
    try {
      const current = resumes.find((r) => r.id === selectedResumeId);
      if (current) {
        const categories = current.content.skills ? [...current.content.skills] : [];
        if (categories.length === 0) {
          categories.push({ id: `skill-${Date.now()}`, name: 'Technical Skills', skills: [...result.missing_skills] });
        } else {
          const existing = new Set(categories.flatMap((c) => c.skills));
          const toAdd = result.missing_skills.filter((s) => !existing.has(s));
          categories[0].skills = [...categories[0].skills, ...toAdd];
        }
        const updatedContent = { ...current.content, skills: categories };
        await api.updateResume(current.id, { content: updatedContent as any });
        alert(`Successfully added ${result.missing_skills.length} missing skill(s) to your resume!`);
      }
    } catch (e) {
      alert('Failed to update resume: ' + e);
    }
  };

  const handleResetForAnotherJob = () => {
    setResult(null);
    setJobTitle('');
    setCompany('');
    setJobDescription('');
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      await api.deleteJobMatchItem(id);
      setHistory(history.filter((h) => h.id !== id));
    } catch (e) {
      alert('Failed to delete history item: ' + e);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BackButton to="/dashboard" label="Back to Dashboard" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-bold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>Keyword & Skill Resonance</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Job Description Matcher
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compare your resume against any job description to discover missing qualifications and tailor bullet points.
          </p>
        </div>

        {/* Selected Resume */}
        {resumes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Target Resume:</span>
            <select
              value={selectedResumeId || ''}
              onChange={(e) => setSelectedResumeId(parseInt(e.target.value, 10))}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Inputs & Analysis Action */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Full Stack Software Engineer"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Company (Optional)
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. NextGen Robotics"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Job Description *
            </label>
            <button
              type="button"
              onClick={() => {
                setJobTitle('Senior Full-Stack Engineer');
                setCompany('TechVanguard Systems');
                setJobDescription(
                  'We are seeking an experienced Full Stack Software Engineer to build scalable web applications. ' +
                  'The ideal candidate has hands-on proficiency with React, TypeScript, FastAPI, PostgreSQL, Docker, and REST APIs. ' +
                  'Experience with CI/CD automation, cloud architecture (AWS), and performance tuning is highly desirable.'
                );
              }}
              className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Load Example Job Posting
            </button>
          </div>
          <textarea
            rows={5}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job requirements or posting here..."
            className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none leading-relaxed"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={handleAnalyze}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Evaluating Match...' : 'Analyze Job Match'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="flex justify-center md:border-r border-slate-100 dark:border-slate-800 pr-4">
              <ScoreGauge score={result.match_score} size="lg" label="Job Match Score" />
            </div>

            <div className="md:col-span-3 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {result.summary_assessment}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent match calculated by semantic skills overlap, title alignment, and domain experience coverage.
              </p>
              {selectedResumeId && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/editor/${selectedResumeId}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                  >
                    <span>Open Resume Editor to Tailor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyMissingSkills}
                    disabled={result.missing_skills.length === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm disabled:opacity-40"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Missing Skills to Resume</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetForAnotherJob}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <span>Analyze Another Job</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Matching Skills ({result.matching_skills.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Skills found in both your resume and the job description.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.matching_skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-xs font-medium"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing or Unmentioned Skills */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Unmentioned Skills ({result.missing_skills.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Desired in the job posting but not found in your resume text.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.missing_skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-xs font-medium"
                  >
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tailoring Recommendations & Relevant Projects */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Lightbulb className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Actionable Tailoring Suggestions
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {result.tailoring_suggestions.map((sug, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>

            {result.relevant_projects.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2">
                  Most Relevant Projects in Your Resume:
                </span>
                <div className="space-y-1">
                  {result.relevant_projects.map((proj, idx) => (
                    <div key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{proj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Analysis History */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Job Match History
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 flex justify-between items-center text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.job_title} {item.company ? `at ${item.company}` : ''}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Analyzed on {new Date(item.created_at).toLocaleDateString()} • {item.matching_count} matched skills
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {item.match_score}%
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteHistory(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

