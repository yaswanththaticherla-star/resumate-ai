import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Settings2,
  Share2,
  Check,
  Palette,
  LayoutTemplate,
  Edit2
} from 'lucide-react';
import { api } from '../services/api';
import { Resume } from '../types';
import { ResumeTemplateRenderer } from '../components/resume/templates/ResumeTemplateRenderer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TEMPLATES = [
  { id: 'ats_classic', label: 'ATS Classic' },
  { id: 'modern_minimal', label: 'Modern Minimal' },
  { id: 'executive', label: 'Executive' },
  { id: 'creative_sidebar', label: 'Creative Sidebar' },
  { id: 'tech_stack', label: 'Tech Stack' },
  { id: 'corporate', label: 'Corporate' },
];

export const ResumePreviewExportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [customFilename, setCustomFilename] = useState('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const previewSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadResume() {
      try {
        setLoading(true);
        let targetId = id ? parseInt(id, 10) : undefined;
        if (!targetId || isNaN(targetId)) {
          const list = await api.listResumes();
          if (list && list.length > 0) {
            targetId = list[0].id;
          }
        }

        if (!targetId) {
          navigate('/dashboard');
          return;
        }

        const data = await api.getResume(targetId);
        setResume(data);
        const cleanName = (data.title || 'Resume').replace(/\s+/g, '_');
        setCustomFilename(`${cleanName}.pdf`);
      } catch (err) {
        console.error(err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadResume();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!previewSheetRef.current || !resume) return;
    setIsExportingPDF(true);
    const element = previewSheetRef.current;
    const originalTransform = element.style.transform;

    try {
      // Temporarily clear scale transform to ensure crisp 100% full-resolution rasterization
      element.style.transform = 'none';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const filename = customFilename.trim().length > 0 
        ? (customFilename.endsWith('.pdf') ? customFilename : `${customFilename}.pdf`)
        : `${resume.title || 'Resume'}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      element.style.transform = originalTransform;
      setIsExportingPDF(false);
    }
  };

  const handleDownloadDocx = () => {
    if (!resume) return;
    window.open(api.exportDocxUrl(resume.id), '_blank');
  };

  const handleShare = async () => {
    if (!resume) return;
    try {
      const res = await api.toggleShare(resume.id);
      const url = `${window.location.origin}/share/${res.share_token}`;
      await navigator.clipboard.writeText(url);
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 3000);
    } catch (err) {
      alert('Failed to generate share link: ' + err);
    }
  };

  const handleUpdatePreference = async (field: keyof Resume, value: string) => {
    if (!resume) return;
    const updated = { ...resume, [field]: value };
    setResume(updated);
    try {
      await api.updateResume(resume.id, { [field]: value });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !resume) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-xs text-slate-400">
        Loading document preview...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 text-left">
      {/* Top Action Header */}
      <header className="h-16 flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-10 print:hidden gap-2">
        <div className="flex items-center gap-3">
          <Link
            to={`/editor/${resume.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Editor</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[200px]">
              {resume.title}
            </span>
          </div>
        </div>

        {/* Center: Filename customization */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <Edit2 className="w-3 h-3 text-slate-400" />
          <input
            type="text"
            value={customFilename}
            onChange={(e) => setCustomFilename(e.target.value)}
            placeholder="filename.pdf"
            className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none text-xs w-48 font-medium"
          />
        </div>

        {/* Right controls: Zoom, Settings, Export */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 15))}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-medium text-[11px] text-slate-600 dark:text-slate-300">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Page Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold transition-colors ${
              showSettings 
                ? 'bg-indigo-50 border-indigo-300 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Page & Style Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Share Link */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
            title="Copy Public Link"
          >
            {shareLinkCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
            title="Print Resume"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Download DOCX */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>DOCX</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            disabled={isExportingPDF}
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPDF ? 'Generating...' : 'Download PDF'}</span>
          </button>
        </div>
      </header>

      {/* Optional Settings Drawer / Bar */}
      {showSettings && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex flex-wrap items-center gap-4 text-xs z-10 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Template:</span>
            <select
              value={resume.template_id}
              onChange={(e) => handleUpdatePreference('template_id', e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Font Size:</span>
            <select
              value={resume.font_size || 'medium'}
              onChange={(e) => handleUpdatePreference('font_size', e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Line Spacing:</span>
            <select
              value={resume.spacing || 'normal'}
              onChange={(e) => handleUpdatePreference('spacing', e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Preview Work Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
        <div
          ref={previewSheetRef}
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
            width: '210mm',
            minHeight: '297mm',
          }}
          className="bg-white text-slate-900 shadow-2xl rounded-sm print:m-0 print:shadow-none print:w-full print:scale-100"
        >
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
