import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Resume } from '../types';
import { ResumeTemplateRenderer } from '../components/resume/templates/ResumeTemplateRenderer';
import { BackButton } from '../components/common/BackButton';
import { Sparkles, Printer, Download, ArrowLeft } from 'lucide-react';

export const PublicResumePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadShared() {
      if (!token) return;
      try {
        setLoading(true);
        const data = await api.getSharedResume(token);
        setResume(data);
      } catch (err: any) {
        setError(err.message || 'Shared resume not found or set to private.');
      } finally {
        setLoading(false);
      }
    }
    loadShared();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-xs text-slate-400">
        Loading shared resume...
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Resume Unavailable
        </h2>
        <p className="text-xs text-slate-500 max-w-sm">
          {error || 'This link may have expired or the author may have disabled public sharing.'}
        </p>
        <Link
          to="/"
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col text-left">
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <BackButton to="/" label="Back to Home" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
              ResuMate AI Shared View
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
          <Link
            to="/"
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
          >
            Build Mine
          </Link>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-8 flex justify-center items-start overflow-y-auto">
        <div className="max-w-[800px] w-full bg-white text-slate-900 shadow-xl rounded-sm print:shadow-none print:w-full">
          <ResumeTemplateRenderer
            templateId={resume.template_id}
            content={resume.content}
            themeColor={resume.theme_color}
            fontFamily={resume.font_family}
            fontSize={resume.font_size}
            spacing={resume.spacing}
          />
        </div>
      </div>
    </div>
  );
};

