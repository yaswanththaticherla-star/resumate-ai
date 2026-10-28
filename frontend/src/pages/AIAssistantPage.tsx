import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Check, 
  X, 
  RefreshCw, 
  Edit3, 
  Wand2, 
  SpellCheck, 
  FileText, 
  CheckCircle2, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { Resume, AISuggestion } from '../types';

export const AIAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'summary' | 'bullets' | 'skills' | 'grammar'>('summary');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Summary Tab State
  const [summaryInput, setSummaryInput] = useState('');
  const [targetRoleInput, setTargetRoleInput] = useState('');
  const [summaryResult, setSummaryResult] = useState<AISuggestion | null>(null);

  // Bullets Tab State
  const [bulletsInput, setBulletsInput] = useState<string[]>(['']);
  const [bulletsResults, setBulletsResults] = useState<AISuggestion[]>([]);

  // Skills Tab State
  const [skillsRoleInput, setSkillsRoleInput] = useState('Full Stack Engineer');
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);

  // Grammar Tab State
  const [grammarInput, setGrammarInput] = useState('');
  const [grammarResult, setGrammarResult] = useState<AISuggestion | null>(null);

  // Editable suggestion mode
  const [isEditingSuggestion, setIsEditingSuggestion] = useState(false);
  const [editedText, setEditedText] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const [statusData, resList] = await Promise.all([
          api.getAIStatus().catch(() => ({ status: 'ready', provider: 'Smart Heuristic NLP Engine', message: 'Operational' })),
          api.listResumes().catch(() => []),
        ]);
        setAiStatus(statusData);
        setResumes(resList);
        if (resList.length > 0) {
          const first = resList[0];
          setSelectedResumeId(first.id);
          setSummaryInput(first.content.summary || '');
          setTargetRoleInput(first.target_role || first.content.personal_info?.headline || '');
          setGrammarInput(first.content.summary || '');
          if (first.content.experience && first.content.experience[0]?.bullets) {
            setBulletsInput(first.content.experience[0].bullets);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  const handleSelectResume = (resId: number) => {
    setSelectedResumeId(resId);
    const chosen = resumes.find((r) => r.id === resId);
    if (chosen) {
      setSummaryInput(chosen.content.summary || '');
      setTargetRoleInput(chosen.target_role || chosen.content.personal_info?.headline || '');
      setGrammarInput(chosen.content.summary || '');
      if (chosen.content.experience && chosen.content.experience[0]?.bullets) {
        setBulletsInput(chosen.content.experience[0].bullets);
      }
    }
  };

  // 1. Run Improve Summary
  const handleImproveSummary = async () => {
    setLoading(true);
    try {
      const res = await api.improveSummary({
        current_summary: summaryInput,
        target_role: targetRoleInput,
      });
      setSummaryResult(res);
      setEditedText(res.improved);
      setIsEditingSuggestion(false);
    } catch (err) {
      alert('Error improving summary: ' + err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Run Enhance Bullets
  const handleEnhanceBullets = async () => {
    setLoading(true);
    try {
      const res = await api.enhanceBullets({
        bullet_points: bulletsInput.filter((b) => b.trim().length > 0),
        job_role: targetRoleInput,
      });
      setBulletsResults(res);
    } catch (err) {
      alert('Error enhancing bullet points: ' + err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Run Suggest Skills
  const handleSuggestSkills = async () => {
    setLoading(true);
    try {
      const currentSkills: string[] = [];
      const current = resumes.find((r) => r.id === selectedResumeId);
      current?.content.skills?.forEach((c) => currentSkills.push(...c.skills));

      const res = await api.suggestSkills({
        target_role: skillsRoleInput,
        current_skills: currentSkills,
      });
      setSuggestedSkills(res);
    } catch (err) {
      alert('Error suggesting skills: ' + err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Run Grammar Check
  const handleCheckGrammar = async () => {
    setLoading(true);
    try {
      const res = await api.grammarCheck({ text: grammarInput });
      setGrammarResult(res);
      setEditedText(res.improved);
      setIsEditingSuggestion(false);
    } catch (err) {
      alert('Error checking grammar: ' + err);
    } finally {
      setLoading(false);
    }
  };

  // Accept Summary into active resume
  const handleAcceptSummary = async () => {
    if (!summaryResult) return;
    if (!selectedResumeId) {
      alert('Please create or select a resume first from the Dashboard to apply changes directly to a saved document.');
      return;
    }
    const finalVal = isEditingSuggestion ? editedText : summaryResult.improved;
    try {
      const current = resumes.find((r) => r.id === selectedResumeId);
      if (current) {
        const updatedContent = { ...current.content, summary: finalVal };
        await api.updateResume(current.id, { content: updatedContent as any });
        setSummaryInput(finalVal);
        setSummaryResult(null);
        alert('Accepted! Summary updated and saved to resume.');
      }
    } catch (e) {
      alert('Failed to save to resume: ' + e);
    }
  };

  // Accept Bullets into active resume first role
  const handleAcceptBullets = async () => {
    if (bulletsResults.length === 0) return;
    if (!selectedResumeId) {
      alert('Please create or select a resume first from the Dashboard to apply changes directly to a saved document.');
      return;
    }
    try {
      const current = resumes.find((r) => r.id === selectedResumeId);
      if (current) {
        let updatedExp = current.content.experience ? [...current.content.experience] : [];
        if (updatedExp.length === 0) {
          updatedExp = [{
            id: `exp-${Date.now()}`,
            company: 'Target Company',
            role: current.target_role || 'Software Engineer',
            location: 'Remote',
            start_date: '2023',
            end_date: 'Present',
            current: true,
            bullets: bulletsResults.map((b) => b.improved),
            technologies: ['React', 'TypeScript', 'Python'],
          }];
        } else {
          updatedExp[0] = {
            ...updatedExp[0],
            bullets: bulletsResults.map((b) => b.improved),
          };
        }
        const updatedContent = { ...current.content, experience: updatedExp };
        await api.updateResume(current.id, { content: updatedContent as any });
        setBulletsInput(updatedExp[0].bullets);
        setBulletsResults([]);
        alert('Accepted! Bullet points updated in your primary experience role.');
      }
    } catch (e) {
      alert('Failed to save: ' + e);
    }
  };

  // Add individual suggested skill to active resume
  const handleAddSkillToResume = async (skill: string) => {
    if (!selectedResumeId) {
      alert('Please create or select a resume first from the Dashboard to add skills directly.');
      return;
    }
    try {
      const current = resumes.find((r) => r.id === selectedResumeId);
      if (current) {
        const categories = current.content.skills ? [...current.content.skills] : [];
        if (categories.length === 0) {
          categories.push({ id: `skill-${Date.now()}`, name: 'Technical Skills', skills: [skill] });
        } else {
          if (!categories[0].skills.includes(skill)) {
            categories[0].skills = [...categories[0].skills, skill];
          }
        }
        const updatedContent = { ...current.content, skills: categories };
        await api.updateResume(current.id, { content: updatedContent as any });
        // remove from suggested list
        setSuggestedSkills((prev) => prev.filter((s) => s !== skill));
        alert(`Added "${skill}" to your resume skills!`);
      }
    } catch (e) {
      alert('Failed to add skill: ' + e);
    }
  };

  // Accept Grammar result into resume summary
  const handleAcceptGrammar = async () => {
    if (!grammarResult) return;
    if (!selectedResumeId) {
      alert('Please create or select a resume first from the Dashboard to apply grammar corrections directly.');
      return;
    }
    try {
      const current = resumes.find((r) => r.id === selectedResumeId);
      if (current) {
        const updatedContent = { ...current.content, summary: grammarResult.improved };
        await api.updateResume(current.id, { content: updatedContent as any });
        setGrammarInput(grammarResult.improved);
        alert('Grammar corrections applied to your resume summary!');
      }
    } catch (e) {
      alert('Failed to save grammar: ' + e);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Resume Copilot</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Career Assistant
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyze, refine, and upgrade your resume content using strong action verbs, XYZ bullet framing, and ATS metrics.
          </p>
        </div>

        {/* Selected Resume context */}
        {resumes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Active Resume:</span>
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
          </div>
        )}
      </div>

      {/* AI Engine Status Alert */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-0.5">
          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Engine: {aiStatus?.provider || 'Smart Heuristic NLP Engine'}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-[10px]">
              Ready
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            {aiStatus?.message || 'Built-in deterministic action verb & ATS keyword analyzer is active.'}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        {[
          { id: 'summary', label: 'Improve Summary', icon: Sparkles },
          { id: 'bullets', label: 'Enhance Bullet Points', icon: Wand2 },
          { id: 'skills', label: 'Skills Suggestions', icon: Layers },
          { id: 'grammar', label: 'Grammar & Spelling', icon: SpellCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: IMPROVE SUMMARY */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Current Professional Summary
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Role
              </label>
              <input
                type="text"
                value={targetRoleInput}
                onChange={(e) => setTargetRoleInput(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Draft Summary
              </label>
              <textarea
                rows={6}
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                placeholder="Enter or paste your summary here..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none leading-relaxed"
              />
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleImproveSummary}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Analyzing with AI...' : 'Improve Summary'}</span>
            </button>
          </div>

          {/* Side-by-Side Comparison Output */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Enhanced AI Suggestion
              </h2>
              {summaryResult && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingSuggestion(!isEditingSuggestion);
                      setEditedText(summaryResult.improved);
                    }}
                    className="p-1.5 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingSuggestion ? 'Done' : 'Edit'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleImproveSummary}
                    title="Regenerate"
                    className="p-1.5 text-slate-500 hover:text-indigo-600"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSummaryResult(null)}
                    title="Reject"
                    className="p-1.5 text-rose-500 hover:text-rose-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {!summaryResult ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Click "Improve Summary" to view an AI-enhanced revision side by side with the original.
              </div>
            ) : (
              <div className="space-y-4">
                {isEditingSuggestion ? (
                  <textarea
                    rows={6}
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                ) : (
                  <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                    {summaryResult.improved}
                  </div>
                )}

                {/* Explanation */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Why this is better:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">{summaryResult.explanation}</p>
                </div>

                {/* Changes List */}
                {summaryResult.changes && summaryResult.changes.length > 0 && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    <strong>Changes:</strong> {summaryResult.changes.join(' • ')}
                  </div>
                )}

                {/* Action CTA */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleAcceptSummary}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept & Apply to Resume</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ENHANCE BULLET POINTS */}
      {activeTab === 'bullets' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Bullet Points Enhancer
              </h2>
              <p className="text-xs text-slate-500">
                Converts weak responsibilities into Google XYZ achievements ("Accomplished [X] as measured by [Y] by doing [Z]").
              </p>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleEnhanceBullets}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
            >
              {loading ? 'Refining...' : 'Enhance All Bullets'}
            </button>
          </div>

          <div className="space-y-3">
            {bulletsInput.map((b, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="text-xs text-slate-400 font-bold w-6">#{idx + 1}</span>
                <input
                  type="text"
                  value={b}
                  onChange={(e) => {
                    const copy = [...bulletsInput];
                    copy[idx] = e.target.value;
                    setBulletsInput(copy);
                  }}
                  placeholder="e.g. helped with database optimizations"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Results Comparison List */}
          {bulletsResults.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Side-by-Side Improvements:
              </h3>
              <div className="space-y-3">
                {bulletsResults.map((res, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Original</span>
                      <p className="text-slate-600 dark:text-slate-400">{res.original}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">Upgraded (Action Voice)</span>
                      <p className="font-semibold text-slate-900 dark:text-white">{res.improved}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAcceptBullets}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept All Bullets into Resume</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SKILLS SUGGESTIONS */}
      {activeTab === 'skills' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Target Role Skills Extractor
            </h2>
            <p className="text-xs text-slate-500">
              Discover industry-standard technical keywords and competencies demanded by hiring teams.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={skillsRoleInput}
              onChange={(e) => setSkillsRoleInput(e.target.value)}
              placeholder="e.g. Backend Engineer, Data Scientist, DevOps"
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
            <button
              type="button"
              disabled={loading}
              onClick={handleSuggestSkills}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
            >
              {loading ? 'Searching...' : 'Suggest Skills'}
            </button>
          </div>

          {suggestedSkills.length > 0 && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                High-Value Skills for {skillsRoleInput}:
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.map((sk, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSkillToResume(sk)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-all shadow-sm"
                    title="Click to add to your resume"
                  >
                    <span className="text-indigo-600 font-bold">+</span>
                    <span>{sk}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GRAMMAR & SPELLING */}
      {activeTab === 'grammar' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Spelling & Typographical Checker
            </h2>
            <p className="text-xs text-slate-500">
              Scans for common typos, punctuation irregularities, and spacing flaws that cause automated ATS rejects.
            </p>
          </div>

          <textarea
            rows={5}
            value={grammarInput}
            onChange={(e) => setGrammarInput(e.target.value)}
            placeholder="Paste any section or bullet point to check..."
            className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />

          <button
            type="button"
            disabled={loading}
            onClick={handleCheckGrammar}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
          >
            {loading ? 'Checking...' : 'Check Spelling & Grammar'}
          </button>

          {grammarResult && (
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3 text-xs">
              <div className="font-bold text-indigo-700 dark:text-indigo-300">
                Audited Text:
              </div>
              <p className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
                {grammarResult.improved}
              </p>
              <div className="text-[11px] text-slate-500">
                <strong>Feedback:</strong> {grammarResult.explanation}
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAcceptGrammar}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept & Apply to Resume Summary</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

