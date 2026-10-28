import React, { useState } from 'react';
import { Sparkles, Check, RefreshCw, Wand2, SpellCheck } from 'lucide-react';
import { api } from '../../../services/api';
import { AISuggestion } from '../../../types';

interface Props {
  summary: string;
  targetRole?: string;
  onChange: (updated: string) => void;
}

export const SummaryForm: React.FC<Props> = ({ summary, targetRole, onChange }) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);

  const wordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0;

  const handleImproveWithAI = async () => {
    setLoadingAI(true);
    try {
      const res = await api.improveSummary({
        current_summary: summary,
        target_role: targetRole || '',
      });
      setSuggestion(res);
    } catch (err) {
      alert('AI improvement failed: ' + err);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleGrammarCheck = async () => {
    setLoadingAI(true);
    try {
      const res = await api.grammarCheck({ text: summary, field_name: 'Summary' });
      setSuggestion(res);
    } catch (err) {
      alert('Grammar check failed: ' + err);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAccept = () => {
    if (suggestion) {
      onChange(suggestion.improved);
      setSuggestion(null);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Professional Summary
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A concise 3-4 sentence overview of your career, core capabilities, and value proposition.
          </p>
        </div>

        {/* AI Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loadingAI}
            onClick={handleGrammarCheck}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <SpellCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Grammar Check</span>
          </button>
          <button
            type="button"
            disabled={loadingAI}
            onClick={handleImproveWithAI}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loadingAI ? 'Analyzing...' : 'AI Enhance'}</span>
          </button>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          rows={5}
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Versatile Full-Stack Engineer with 4+ years of experience architecting resilient distributed systems and modern React web applications. Proven track record in reducing API latency and leading agile cross-functional delivery..."
          className="w-full p-3.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
        />
        <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
          <span>
            {wordCount} words {wordCount < 30 ? '(recommend 35-65 words)' : wordCount > 80 ? '(a bit long)' : '✓ ideal length'}
          </span>
          <span className="text-slate-400">ATS optimized</span>
        </div>
      </div>

      {/* AI Suggestion Card */}
      {suggestion && (
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4" /> AI Suggestion
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSuggestion(null)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 px-2 py-1"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                <Check className="w-3.5 h-3.5" /> Accept Suggestion
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/40 leading-relaxed font-sans">
            {suggestion.improved}
          </p>

          {suggestion.explanation && (
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
              <strong>Rationale:</strong> {suggestion.explanation}
            </p>
          )}

          {suggestion.changes && suggestion.changes.length > 0 && (
            <div className="text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Changes applied:</span> {suggestion.changes.join(' • ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

