import React from 'react';
import { 
  User, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  FolderGit2, 
  Award, 
  Trophy, 
  Languages, 
  PlusCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export interface SectionItem {
  id: string;
  label: string;
  icon: any;
}

export const AVAILABLE_SECTIONS: SectionItem[] = [
  { id: 'personal_info', label: 'Personal Info', icon: User },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'languages', label: 'Languages', icon: Languages },
  { id: 'custom_sections', label: 'Custom Sections', icon: PlusCircle },
];

interface SectionNavProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
  hiddenSections?: string[];
  onToggleHidden?: (id: string) => void;
}

export const SectionNav: React.FC<SectionNavProps> = ({
  activeSection,
  onSelectSection,
  hiddenSections = [],
  onToggleHidden,
}) => {
  return (
    <nav className="space-y-1 p-2">
      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Resume Sections
      </div>
      {AVAILABLE_SECTIONS.map((sec) => {
        const Icon = sec.icon;
        const isActive = activeSection === sec.id;
        const isHidden = hiddenSections.includes(sec.id);

        return (
          <div
            key={sec.id}
            className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
              isActive
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold shadow-sm'
                : isHidden
                ? 'text-slate-400 opacity-60 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectSection(sec.id)}
              className="flex items-center gap-2.5 flex-1 text-left min-w-0"
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              <span className="truncate">{sec.label}</span>
            </button>

            {onToggleHidden && sec.id !== 'personal_info' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHidden(sec.id);
                }}
                title={isHidden ? 'Show section' : 'Hide from resume'}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
};

