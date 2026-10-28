import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  Sparkles, 
  HelpCircle, 
  CheckSquare, 
  Linkedin, 
  ExternalLink,
  Kanban
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';
import { JobApplication, Resume } from '../types';
import { Modal } from '../components/common/Modal';
import { BackButton } from '../components/common/BackButton';

interface CareerToolsProps {
  initialTab?: 'tracker' | 'interview' | 'linkedin' | 'checklist';
}

export const CareerToolsPage: React.FC<CareerToolsProps> = ({ initialTab = 'tracker' }) => {
  const [activeTab, setActiveTab] = useState<'tracker' | 'interview' | 'linkedin' | 'checklist'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  // New application modal
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);
  const [appCompany, setAppCompany] = useState('');
  const [appRole, setAppRole] = useState('');
  const [appLocation, setAppLocation] = useState('');
  const [appSalary, setAppSalary] = useState('');
  const [appStatus, setAppStatus] = useState<'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected'>('applied');
  const [appNotes, setAppNotes] = useState('');

  const { user } = useAuth();

  // Interview Questions Generator State
  const [selectedResumeId, setSelectedResumeId] = useState<number | undefined>(undefined);
  const [targetRole, setTargetRole] = useState(user?.headline || 'Software Engineer');
  const [interviewCompany, setInterviewCompany] = useState('');
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // LinkedIn Summary State
  const [linkedinName, setLinkedinName] = useState(user?.full_name || '');
  const [linkedinRole, setLinkedinRole] = useState(user?.headline || 'Software Engineer');
  const [linkedinSkills, setLinkedinSkills] = useState('');
  const [linkedinDraft, setLinkedinDraft] = useState<any>(null);
  const [isDraftingLinkedin, setIsDraftingLinkedin] = useState(false);

  // Internship Checklist State
  const [checklistPhases, setChecklistPhases] = useState<any[]>([]);
  const [checkedItems, setCheckedItems] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [appList, resList, chkList] = await Promise.all([
          api.listJobApplications().catch(() => []),
          api.listResumes().catch(() => []),
          api.getInternshipChecklist().catch(() => []),
        ]);
        setApplications(appList);
        setResumes(resList);
        setChecklistPhases(chkList);
        if (resList.length > 0) {
          const first = resList[0];
          setSelectedResumeId(first.id);
          const p = first.content.personal_info;
          if (p?.full_name) setLinkedinName(p.full_name);
          if (first.target_role || p?.headline) {
            setLinkedinRole(first.target_role || p?.headline || 'Software Engineer');
            setTargetRole(first.target_role || p?.headline || 'Software Engineer');
          }
          if (first.content.skills && first.content.skills.length > 0) {
            const skillsFlat = first.content.skills.flatMap((c) => c.skills);
            if (skillsFlat.length > 0) {
              setLinkedinSkills(skillsFlat.slice(0, 8).join(', '));
            }
          }
        } else if (user) {
          if (user.full_name) setLinkedinName(user.full_name);
          if (user.headline) {
            setLinkedinRole(user.headline);
            setTargetRole(user.headline);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleCreateApplication = async () => {
    if (!appCompany.trim() || !appRole.trim()) {
      alert('Company and Job Title are required.');
      return;
    }
    try {
      const created = await api.createJobApplication({
        company: appCompany,
        job_title: appRole,
        location: appLocation,
        salary_range: appSalary,
        status: appStatus,
        notes: appNotes,
        applied_date: new Date().toISOString().split('T')[0],
      });
      setApplications([created, ...applications]);
      setIsAddAppModalOpen(false);
      setAppCompany('');
      setAppRole('');
      setAppNotes('');
    } catch (err) {
      alert('Failed to save application: ' + err);
    }
  };

  const handleDeleteApplication = async (id: number) => {
    try {
      await api.deleteJobApplication(id);
      setApplications(applications.filter((a) => a.id !== id));
    } catch (err) {
      alert('Failed to delete: ' + err);
    }
  };

  const handleStatusChange = async (appId: number, newStatus: any) => {
    try {
      const updated = await api.updateJobApplication(appId, { status: newStatus });
      setApplications(applications.map((a) => (a.id === appId ? updated : a)));
    } catch (e) {
      alert('Failed to update status: ' + e);
    }
  };

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const res = await api.generateInterviewQuestions({
        resume_id: selectedResumeId,
        target_role: targetRole,
        company_name: interviewCompany,
      });
      setInterviewQuestions(res.questions);
    } catch (e) {
      alert('Failed to generate interview questions: ' + e);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleDraftLinkedIn = async () => {
    setIsDraftingLinkedin(true);
    try {
      const skillsArray = linkedinSkills.split(',').map((s) => s.trim());
      const res = await api.generateLinkedInSummary({
        full_name: linkedinName,
        target_role: linkedinRole,
        skills: skillsArray,
      });
      setLinkedinDraft(res);
    } catch (e) {
      alert('Failed to draft LinkedIn summary: ' + e);
    } finally {
      setIsDraftingLinkedin(false);
    }
  };

  const toggleChecklistItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const STAGES = [
    { id: 'saved', label: 'Saved', color: 'border-slate-300 dark:border-slate-700' },
    { id: 'applied', label: 'Applied', color: 'border-indigo-400' },
    { id: 'interviewing', label: 'Interviewing', color: 'border-amber-400' },
    { id: 'offered', label: 'Offer Received', color: 'border-emerald-400' },
    { id: 'rejected', label: 'Archived', color: 'border-rose-400' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BackButton to="/dashboard" label="Back to Dashboard" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job Search Toolkit</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Career Tools & Job Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track job applications, prepare for interview questions tailored to your resume, and generate LinkedIn profiles.
          </p>
        </div>

        {activeTab === 'tracker' && (
          <button
            type="button"
            onClick={() => setIsAddAppModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Track Application</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        {[
          { id: 'tracker', label: 'Job Tracker', icon: Kanban },
          { id: 'interview', label: 'Interview Prep', icon: HelpCircle },
          { id: 'linkedin', label: 'LinkedIn Bio Drafter', icon: Linkedin },
          { id: 'checklist', label: 'Internship Checklist', icon: CheckSquare },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: JOB APPLICATION TRACKER */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          {applications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No applications tracked yet.</p>
              <button
                type="button"
                onClick={() => setIsAddAppModalOpen(true)}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                + Add your first job application
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {STAGES.map((stage) => {
                const stageApps = applications.filter((a) => a.status === stage.id);
                return (
                  <div
                    key={stage.id}
                    className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {stage.label}
                      </span>
                      <span className="text-[10px] font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500">
                        {stageApps.length}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1">
                      {stageApps.map((app) => (
                        <div
                          key={app.id}
                          className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs relative group"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">
                                {app.company}
                              </h4>
                              <p className="text-[11px] text-slate-500">{app.job_title}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteApplication(app.id)}
                              className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {app.location && (
                            <div className="text-[10px] text-slate-400">{app.location}</div>
                          )}

                          {/* Quick stage mover */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              className="w-full text-[10px] p-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
                            >
                              <option value="saved">Move to: Saved</option>
                              <option value="applied">Move to: Applied</option>
                              <option value="interviewing">Move to: Interviewing</option>
                              <option value="offered">Move to: Offered</option>
                              <option value="rejected">Move to: Archived</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERVIEW QUESTION GENERATOR */}
      {activeTab === 'interview' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Tailored Interview Preparation
            </h2>
            <p className="text-xs text-slate-500">
              Generates realistic behavioral, technical, and system design interview questions directly referencing your resume projects.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={interviewCompany}
                onChange={(e) => setInterviewCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            {resumes.length > 0 && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resume Context
                </label>
                <select
                  value={selectedResumeId || ''}
                  onChange={(e) => setSelectedResumeId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
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

          <button
            type="button"
            disabled={isGeneratingQuestions}
            onClick={handleGenerateQuestions}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGeneratingQuestions ? 'Generating Questions...' : 'Generate 5 Targeted Questions'}</span>
          </button>

          {interviewQuestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Generated Questions & Strategic Tips
              </h3>
              <div className="space-y-3">
                {interviewQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                        {q.category}
                      </span>
                      <span className="text-slate-400 text-[11px]">Question {idx + 1} of 5</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      "{q.question}"
                    </p>
                    <div className="text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <strong className="text-indigo-600 dark:text-indigo-400">Coaching Advice: </strong>
                      {q.tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LINKEDIN BIO DRAFTER */}
      {activeTab === 'linkedin' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              LinkedIn Profile & Summary Drafter
            </h2>
            <p className="text-xs text-slate-500">
              Transform your resume achievements into an engaging LinkedIn headline and About section.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={linkedinName}
                onChange={(e) => setLinkedinName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Headline Role
              </label>
              <input
                type="text"
                value={linkedinRole}
                onChange={(e) => setLinkedinRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Core Competencies
              </label>
              <input
                type="text"
                value={linkedinSkills}
                onChange={(e) => setLinkedinSkills(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={isDraftingLinkedin}
            onClick={handleDraftLinkedIn}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isDraftingLinkedin ? 'Drafting...' : 'Generate LinkedIn Bio'}</span>
          </button>

          {linkedinDraft && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">
                  Optimized LinkedIn Headline:
                </label>
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 font-semibold text-indigo-900 dark:text-indigo-200">
                  {linkedinDraft.headline}
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">
                  About Section:
                </label>
                <textarea
                  rows={8}
                  readOnly
                  value={linkedinDraft.about}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 leading-relaxed font-sans"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: INTERNSHIP APPLICATION CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Application & Interview Checklist
            </h2>
            <p className="text-xs text-slate-500">
              Actionable milestones recommended for students, freshers, and software engineers applying to top tech firms.
            </p>
          </div>

          <div className="space-y-6">
            {checklistPhases.map((phase, pIdx) => (
              <div key={pIdx} className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {phase.phase}
                </h3>
                <div className="space-y-2">
                  {phase.items.map((item: any) => {
                    const isDone = !!checkedItems[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                          isDone
                            ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'
                            : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => {}}
                            className="rounded text-indigo-600 h-4 w-4"
                          />
                          <span className={isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}>
                            {item.label}
                          </span>
                        </div>
                        {item.recommended && (
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                            Recommended
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      <Modal
        isOpen={isAddAppModalOpen}
        onClose={() => setIsAddAppModalOpen(false)}
        title="Track New Application"
        subtitle="Log details to stay on top of interview rounds and follow-ups."
      >
        <div className="space-y-3.5 text-xs text-left">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Company Name *
            </label>
            <input
              type="text"
              value={appCompany}
              onChange={(e) => setAppCompany(e.target.value)}
              placeholder="e.g. Stripe, Apple, Netflix"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Job Title *
            </label>
            <input
              type="text"
              value={appRole}
              onChange={(e) => setAppRole(e.target.value)}
              placeholder="e.g. Software Engineer II"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Location
              </label>
              <input
                type="text"
                value={appLocation}
                onChange={(e) => setAppLocation(e.target.value)}
                placeholder="Remote / New York"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                value={appStatus}
                onChange={(e) => setAppStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offered">Offer Received</option>
                <option value="rejected">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Notes & Follow-up Details
            </label>
            <textarea
              rows={3}
              value={appNotes}
              onChange={(e) => setAppNotes(e.target.value)}
              placeholder="Recruiter contact, referral details, or round 1 date..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddAppModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateApplication}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
            >
              Save Application
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

