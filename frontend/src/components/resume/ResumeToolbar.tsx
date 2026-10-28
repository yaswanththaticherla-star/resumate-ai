import React from 'react';
import { 
  Save, 
  RotateCcw, 
  RotateCw, 
  Eye, 
  Download, 
  Palette, 
  Type, 
  LayoutTemplate,
  Check,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BackButton } from '../common/BackButton';

interface ToolbarProps {
  resumeId: number;
  templateId: string;
  themeColor: string;
  fontFamily: string;
  fontSize: string;
  spacing: string;
  isSaving: boolean;
  hasUnsaved: boolean;
  onSave: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onChangeTemplate: (t: string) => void;
  onChangeColor: (c: string) => void;
  onChangeFont: (f: string) => void;
  onChangeFontSize: (s: string) => void;
  onChangeSpacing: (sp: string) => void;
}

const TEMPLATES = [
  { id: 'ats_classic', label: 'ATS Classic' },
  { id: 'modern_pro', label: 'Modern Pro' },
  { id: 'software_dev', label: 'Software Dev' },
  { id: 'student_fresher', label: 'Student / Fresher' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'executive', label: 'Executive' },
];

const COLORS = [
  { color: '#4F46E5', label: 'Indigo' },
  { color: '#0F172A', label: 'Navy' },
  { color: '#059669', label: 'Emerald' },
  { color: '#0284C7', label: 'Sky Blue' },
  { color: '#E11D48', label: 'Rose' },
  { color: '#7C3AED', label: 'Purple' },
];

const FONTS = [
  { font: 'Inter', label: 'Inter (Sans)' },
  { font: 'Merriweather', label: 'Merriweather (Serif)' },
  { font: 'JetBrains Mono', label: 'JetBrains (Mono)' },
];

export const ResumeToolbar: React.FC<ToolbarProps> = ({
  resumeId,
  templateId,
  themeColor,
  fontFamily,
  fontSize,
  spacing,
  isSaving,
  hasUnsaved,
  onSave,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onChangeTemplate,
  onChangeColor,
  onChangeFont,
  onChangeFontSize,
  onChangeSpacing,
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 z-20">
      {/* Left controls: Template, Font, Color */}
      <div className="flex flex-wrap items-center gap-2">
        <BackButton to="/my-resumes" label="My Resumes" />

        {/* Template Selector */}
        <div className="flex items-center gap-1.5">
          <LayoutTemplate className="w-4 h-4 text-slate-400 hidden sm:inline" />
          <select
            value={templateId}
            onChange={(e) => onChangeTemplate(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Selector */}
        <div className="flex items-center gap-1">
          <Type className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          <select
            value={fontFamily}
            onChange={(e) => onChangeFont(e.target.value)}
            title="Font Family"
            className="text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {FONTS.map((f) => (
              <option key={f.font} value={f.font}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size Selector */}
        <div className="flex items-center gap-1">
          <select
            value={fontSize}
            onChange={(e) => onChangeFontSize(e.target.value)}
            title="Font Size"
            className="text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* Spacing Selector */}
        <div className="flex items-center gap-1">
          <select
            value={spacing}
            onChange={(e) => onChangeSpacing(e.target.value)}
            title="Line Spacing"
            className="text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1 pl-1">
          {COLORS.map((c) => (
            <button
              key={c.color}
              type="button"
              onClick={() => onChangeColor(c.color)}
              title={c.label}
              style={{ backgroundColor: c.color }}
              className={`w-4 h-4 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                themeColor.toLowerCase() === c.color.toLowerCase() ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : ''
              }`}
            >
              {themeColor.toLowerCase() === c.color.toLowerCase() && (
                <Check className="w-2.5 h-2.5 text-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right controls: Save, Undo/Redo, Export */}
      <div className="flex items-center gap-2">
        {/* Autosave status indicator */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 pr-2 hidden sm:flex">
          {isSaving ? (
            <>
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span className="text-amber-600 font-medium">Saving...</span>
            </>
          ) : hasUnsaved ? (
            <span className="text-amber-500 font-medium">● Unsaved edits</span>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 font-medium">Autosaved</span>
            </>
          )}
        </div>

        {/* Undo & Redo */}
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
        {onRedo && (
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Manual Save Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>

        {/* Preview & Export CTA */}
        <Link
          to={`/preview/${resumeId}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview & Export</span>
        </Link>
      </div>
    </div>
  );
};

