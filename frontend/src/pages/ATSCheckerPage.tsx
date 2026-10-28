import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ArrowRight, 
  Wrench, 
  RefreshCw, 
  ExternalLink,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { Resume, ATSResult, ATSIssue } from '../types';
import { ScoreGauge } from '../components/common/ScoreGauge';

export const ATSCheckerPage: React.FC = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    async function loadResumes() {
      try {
        setLoading(true);
        const list = await api.listResumes();
        setResumes(list);
        if (list.length > 0) {
          setSelectedResumeId(list[0].id);
          const result = await api.analyzeATS(list[0].id);
          setAtsResult(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadResumes();
  }, []);

  const handleSelectResume = async (id: number) => {
    setSelectedResumeId(id);
    setLoading(true);
    try {
      const result = await api.analyzeATS(id);
      setAtsResult(result);
    } catch (err) {
      alert('Failed to analyze resume: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleFixNow = (issue: ATSIssue) => {
    if (!selectedResumeId) return;
    // Navigate directly into editor with active section
    const targetSection = issue.section || issue.fix_data?.section || 'personal_info';
    navigate(`/editor/${selectedResumeId}?section=${targetSection}`);
  };

  const filteredIssues = (atsResult?.issues || []).filter((issue) => {
    if (filterSeverity === 'all') return true;
    return issue.severity === filterSeverity;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Applicant Tracking System Readiness</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            ATS Readiness Checker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deterministic evaluation of headings, contact verification, quantifiable metrics, and parsing safety.
          </p>
        </div>

        {/* Selected resume picker and action controls */}
        {resumes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Audit Resume:</span>
            <select
              value={selectedResumeId || ''}
              onChange={(e) => handleSelectResume(parseInt(e.target.value, 10))}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
            {selectedResumeId && (
              <>
                <button
                  type="button"
                  onClick={() => handleSelectResume(selectedResumeId)}
                  disabled={loading}
                  className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Re-scan Resume"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/editor/${selectedResumeId}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <span>Open in Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Auditing resume against ATS standards...</div>
      ) : !atsResult ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Resume Available for ATS Audit
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first resume to run an automated, deterministic audit of contact details, action verbs, and ATS compliance.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                const created = await api.createResume({ title: 'My Professional Resume' });
                navigate(`/editor/${created.id}`);
              } catch (e) {
                alert('Failed to create resume: ' + e);
              }
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
          >
            + Create Resume to Audit
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Score & Summary Banner */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Score Gauge */}
            <div className="flex justify-center md:border-r border-slate-100 dark:border-slate-800 pr-4">
              <ScoreGauge score={atsResult.score} size="lg" label="ATS Overall Score" />
            </div>

            {/* Summary Text & Breakdown */}
            <div className="md:col-span-3 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {atsResult.summary_feedback}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Evaluated across contact information, professional summary, experience metrics, skill groupings, and formatting.
                </p>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Audits</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{atsResult.total_checks}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-emerald-600 block text-[10px] uppercase font-bold">Passed</span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{atsResult.passed_checks}</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
                  <span className="text-rose-600 block text-[10px] uppercase font-bold">Critical</span>
                  <span className="text-lg font-bold text-rose-700 dark:text-rose-300">{atsResult.critical_count}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-amber-600 block text-[10px] uppercase font-bold">Warnings</span>
                  <span className="text-lg font-bold text-amber-700 dark:text-amber-300">{atsResult.warning_count}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Breakdown Gauges */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Section Readiness Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(atsResult.section_scores).map(([sec, score]) => (
                <div key={sec} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 capitalize">
                    {sec.replace('_', ' ')}
                  </span>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {score}%
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issues Audit List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Filter toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Detailed Diagnostic Checks ({filteredIssues.length})
              </h3>
              <div className="flex gap-1.5 text-xs">
                {['all', 'critical', 'warning', 'suggestion', 'passed'].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setFilterSeverity(filter)}
                    className={`px-3 py-1 rounded-lg font-medium capitalize transition-colors ${
                      filterSeverity === filter
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Issues List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredIssues.map((issue) => {
                const isPassed = issue.severity === 'passed';
                const isCritical = issue.severity === 'critical';
                const isWarning = issue.severity === 'warning';

                return (
                  <div
                    key={issue.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isPassed && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                        {isCritical && <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />}
                        {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                        {!isPassed && !isCritical && !isWarning && <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {issue.title}
                          </h4>
                          <span
                            className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                              isPassed
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : isCritical
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                                : isWarning
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                            }`}
                          >
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                          {issue.description}
                        </p>
                      </div>
                    </div>

                    {!isPassed && issue.fix_action && (
                      <button
                        type="button"
                        onClick={() => handleFixNow(issue)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] flex-shrink-0"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Fix Now</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legal / Reality Notice */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed text-left">
            <strong>Transparency Notice:</strong> While a high ATS score confirms that your resume satisfies the formatting, heading, and keyword parsing heuristics used by major enterprise Applicant Tracking Systems (e.g. Workday, Greenhouse, Taleo), human recruiter evaluations and hiring decisions depend on overall candidate fit and business context.
          </div>
        </div>
      )}
    </div>
  );
};

