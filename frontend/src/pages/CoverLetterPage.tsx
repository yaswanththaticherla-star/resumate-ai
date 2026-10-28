import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Sparkles, 
  Save, 
  Printer, 
  Download, 
  Copy, 
  Trash2, 
  Plus, 
  Eye, 
  Edit3, 
  FileText,
  Building2,
  Briefcase
} from 'lucide-react';
import { api } from '../services/api';
import { CoverLetter, Resume } from '../types';
import { BackButton } from '../components/common/BackButton';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const CoverLetterPage: React.FC = () => {
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form inputs
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState<number | undefined>(undefined);
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('standard');
  const [content, setContent] = useState('');

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [letterList, resList] = await Promise.all([
          api.listCoverLetters().catch(() => []),
          api.listResumes().catch(() => []),
        ]);
        setLetters(letterList);
        setResumes(resList);
        if (resList.length > 0) {
          setSelectedResumeId(resList[0].id);
          if (resList[0].target_role) {
            setJobTitle(resList[0].target_role);
          }
        }
        if (letterList.length > 0) {
          loadLetter(letterList[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const loadLetter = (cl: CoverLetter) => {
    setSelectedLetter(cl);
    setCompanyName(cl.company_name);
    setJobTitle(cl.job_title);
    setRecipientName(cl.recipient_name || '');
    setJobDescription(cl.job_description || '');
    setSelectedResumeId(cl.resume_id);
    setTone(cl.tone || 'professional');
    setLength(cl.length || 'standard');
    setContent(cl.content || '');
  };

  const handleGenerateLetter = async () => {
    setIsGenerating(true);
    try {
      const created = await api.createCoverLetter({
        title: `Cover Letter - ${companyName}`,
        company_name: companyName,
        job_title: jobTitle,
        recipient_name: recipientName,
        job_description: jobDescription,
        resume_id: selectedResumeId,
        tone: tone,
        length: length,
      });
      setLetters([created, ...letters]);
      loadLetter(created);
    } catch (err) {
      alert('Generation failed: ' + err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedLetter) return;
    setIsSaving(true);
    try {
      const updated = await api.updateCoverLetter(selectedLetter.id, {
        company_name: companyName,
        job_title: jobTitle,
        recipient_name: recipientName,
        job_description: jobDescription,
        tone: tone,
        length: length,
        content: content,
      });
      setSelectedLetter(updated);
      setLetters(letters.map((l) => (l.id === updated.id ? updated : l)));
      alert('Saved successfully!');
    } catch (err) {
      alert('Failed to save: ' + err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!selectedLetter) return;
    try {
      const copy = await api.duplicateCoverLetter(selectedLetter.id);
      setLetters([copy, ...letters]);
      loadLetter(copy);
    } catch (e) {
      alert('Duplicate failed: ' + e);
    }
  };

  const handleDelete = async () => {
    if (!selectedLetter) return;
    if (!confirm('Are you sure you want to delete this cover letter?')) return;
    try {
      await api.deleteCoverLetter(selectedLetter.id);
      const remaining = letters.filter((l) => l.id !== selectedLetter.id);
      setLetters(remaining);
      if (remaining.length > 0) {
        loadLetter(remaining[0]);
      } else {
        setSelectedLetter(null);
        setContent('');
      }
    } catch (e) {
      alert('Delete failed: ' + e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff' 
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ 
        orientation: 'portrait', 
        unit: 'mm', 
        format: 'a4' 
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Cover_Letter_${(companyName || 'Document').replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
      window.print();
    }
  };

  const handleCreateManual = async () => {
    try {
      const created = await api.createCoverLetter({
        title: `Cover Letter - ${companyName || 'New'}`,
        company_name: companyName || 'Target Company',
        job_title: jobTitle || 'Position',
        recipient_name: recipientName || 'Hiring Manager',
        content: `Dear Hiring Manager at ${companyName || 'your organization'},\n\nI am writing to express my strong enthusiasm for the ${jobTitle || 'role'} position. My technical expertise and passion for building high-performing software align well with your company's mission.\n\nThank you for reviewing my application. I look forward to speaking with you.\n\nSincerely,\nAlex Morgan`,
      });
      setLetters([created, ...letters]);
      loadLetter(created);
    } catch (err) {
      alert('Failed to create manual letter: ' + err);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BackButton to="/dashboard" label="Back to Dashboard" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[11px] font-bold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" />
              <span>Targeted Outreach</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cover Letter Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate and customize tailored letters matching target company mission without fabricating experience.
          </p>
        </div>

        {/* Existing letters selector */}
        {letters.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Saved Letters:</span>
            <select
              value={selectedLetter?.id || ''}
              onChange={(e) => {
                const found = letters.find((l) => l.id === parseInt(e.target.value, 10));
                if (found) loadLetter(found);
              }}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              {letters.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.company_name} — {l.job_title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Grid: Inputs vs Live Document Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Job & Target Details
            </h2>
            <button
              type="button"
              onClick={() => {
                setCompanyName('Vanguard Systems');
                setJobTitle('Senior Full-Stack Engineer');
                setRecipientName('Hiring Committee');
                setJobDescription('Looking for a Senior Full-Stack Engineer experienced in React, TypeScript, and FastAPI to lead modern product initiatives.');
              }}
              className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Load Example
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. OpenAI, Stripe, Google"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Job Title *
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Lead Software Engineer"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hiring Manager (Optional)
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Dr. Jane Smith or Leave blank for 'Hiring Team'"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="professional">Professional</option>
                  <option value="confident">Confident</option>
                  <option value="friendly">Engaging</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Length
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="concise">Concise (3 paras)</option>
                  <option value="standard">Standard (4 paras)</option>
                  <option value="detailed">Detailed (5 paras)</option>
                </select>
              </div>
            </div>

            {resumes.length > 0 && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pull Skills & Experience From:
                </label>
                <select
                  value={selectedResumeId || ''}
                  onChange={(e) => setSelectedResumeId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Job Description / Context (Optional)
              </label>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job requirements to tailor the letter to specific technologies..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateLetter}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
            </button>
            <button
              type="button"
              onClick={handleCreateManual}
              className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Manually</span>
            </button>
          </div>
        </div>

        {/* Right Live Document Preview & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Document Preview
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !content}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={!selectedLetter}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Duplicate"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Print"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
              {selectedLetter && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Letter Sheet */}
          <div
            ref={printRef}
            className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-md min-h-[500px] text-xs leading-relaxed space-y-4 font-serif text-left print:p-0 print:border-none print:shadow-none"
          >
            {content ? (
              <textarea
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:outline-none resize-none font-serif text-xs leading-relaxed text-slate-800"
              />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 font-sans space-y-2">
                <FileText className="w-8 h-8 opacity-40" />
                <p>Fill out the company and job title, then click "Generate with AI".</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

