import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Resume, ResumeContent } from '../types';
import { api } from '../services/api';
import { SectionNav } from '../components/resume/SectionNav';
import { ResumeToolbar } from '../components/resume/ResumeToolbar';
import { PersonalInfoForm } from '../components/resume/forms/PersonalInfoForm';
import { SummaryForm } from '../components/resume/forms/SummaryForm';
import { ExperienceForm } from '../components/resume/forms/ExperienceForm';
import { EducationForm } from '../components/resume/forms/EducationForm';
import { SkillsForm } from '../components/resume/forms/SkillsForm';
import { ProjectsForm } from '../components/resume/forms/ProjectsForm';
import { CertificationsForm } from '../components/resume/forms/CertificationsForm';
import { AchievementsForm } from '../components/resume/forms/AchievementsForm';
import { LanguagesForm } from '../components/resume/forms/LanguagesForm';
import { CustomSectionsForm } from '../components/resume/forms/CustomSectionsForm';
import { ResumeTemplateRenderer } from '../components/resume/templates/ResumeTemplateRenderer';
import { Eye, Edit3 } from 'lucide-react';

export const ResumeEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('personal_info');
  const [activeMobileTab, setActiveMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // History for Undo / Redo
  const [history, setHistory] = useState<ResumeContent[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Debounced autosave ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync active section from query param (e.g. from ATS Checker Fix Now)
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadResume() {
      try {
        setLoading(true);
        if (!id) {
          const list = await api.listResumes();
          if (list && list.length > 0) {
            navigate(`/editor/${list[0].id}`, { replace: true });
            return;
          }
          const created = await api.createResume({ title: 'My Professional Resume' });
          navigate(`/editor/${created.id}`, { replace: true });
          return;
        }

        const data = await api.getResume(parseInt(id, 10));
        setResume(data);
        setHistory([data.content]);
        setHistoryIndex(0);
      } catch (err) {
        console.warn('Resume load fallback:', err);
        const list = await api.listResumes();
        if (list && list.length > 0) {
          navigate(`/editor/${list[0].id}`, { replace: true });
        } else {
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    }
    loadResume();
  }, [id, navigate]);

  const handleContentChange = (newContent: ResumeContent) => {
    if (!resume) return;

    // Update state
    setResume({ ...resume, content: newContent });
    setHasUnsaved(true);

    // Append to history (cap at 20 steps)
    const newHist = history.slice(0, historyIndex + 1);
    if (newHist.length >= 20) newHist.shift();
    newHist.push(newContent);
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);

    // Debounced autosave (1.5 seconds)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      persistResume({ ...resume, content: newContent });
    }, 1500);
  };

  const persistResume = async (updatedResume: Resume) => {
    setIsSaving(true);
    try {
      const saved = await api.updateResume(updatedResume.id, {
        title: updatedResume.title,
        template_id: updatedResume.template_id,
        theme_color: updatedResume.theme_color,
        font_family: updatedResume.font_family,
        font_size: updatedResume.font_size,
        spacing: updatedResume.spacing,
        content: updatedResume.content as any,
      });
      setResume((prev) => (prev ? { ...prev, ats_score: saved.ats_score } : null));
      setHasUnsaved(false);
    } catch (err) {
      console.error('Autosave error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = () => {
    if (resume) {
      persistResume(resume);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0 && resume) {
      const prevIdx = historyIndex - 1;
      const prevContent = history[prevIdx];
      setHistoryIndex(prevIdx);
      setResume({ ...resume, content: prevContent });
      persistResume({ ...resume, content: prevContent });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && resume) {
      const nextIdx = historyIndex + 1;
      const nextContent = history[nextIdx];
      setHistoryIndex(nextIdx);
      setResume({ ...resume, content: nextContent });
      persistResume({ ...resume, content: nextContent });
    }
  };

  const handleToggleHidden = (sectionId: string) => {
    if (!resume) return;
    const currentHidden = resume.content.hidden_sections || [];
    const updatedHidden = currentHidden.includes(sectionId)
      ? currentHidden.filter((s) => s !== sectionId)
      : [...currentHidden, sectionId];

    handleContentChange({
      ...resume.content,
      hidden_sections: updatedHidden,
    });
  };

  if (loading || !resume) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-xs text-slate-400">
        Loading resume editor...
      </div>
    );
  }

  const content = resume.content;

  const ALL_MOBILE_SECTIONS = [
    'personal_info',
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
    'certifications',
    'achievements',
    'languages',
    'custom_sections',
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top Controls Toolbar */}
      <ResumeToolbar
        resumeId={resume.id}
        templateId={resume.template_id}
        themeColor={resume.theme_color}
        fontFamily={resume.font_family}
        fontSize={resume.font_size}
        spacing={resume.spacing}
        isSaving={isSaving}
        hasUnsaved={hasUnsaved}
        onSave={handleManualSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onChangeTemplate={(t) => {
          const updated = { ...resume, template_id: t };
          setResume(updated);
          persistResume(updated);
        }}
        onChangeColor={(c) => {
          const updated = { ...resume, theme_color: c };
          setResume(updated);
          persistResume(updated);
        }}
        onChangeFont={(f) => {
          const updated = { ...resume, font_family: f };
          setResume(updated);
          persistResume(updated);
        }}
        onChangeFontSize={(s) => {
          const updated = { ...resume, font_size: s };
          setResume(updated);
          persistResume(updated);
        }}
        onChangeSpacing={(sp) => {
          const updated = { ...resume, spacing: sp };
          setResume(updated);
          persistResume(updated);
        }}
      />

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveMobileTab('edit')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
            activeMobileTab === 'edit'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Form</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('preview')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
            activeMobileTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section Navigation (Desktop only) */}
        <div className="hidden lg:block w-52 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
          <SectionNav
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            hiddenSections={content.hidden_sections || []}
            onToggleHidden={handleToggleHidden}
          />
        </div>

        {/* Center Editing Form Container */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:max-w-2xl xl:max-w-3xl ${
            activeMobileTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
            {/* Section tabs for tablet/mobile */}
            <div className="lg:hidden mb-4 overflow-x-auto pb-2 flex gap-1 border-b border-slate-200 dark:border-slate-800">
              {ALL_MOBILE_SECTIONS.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setActiveSection(sec)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap capitalize ${
                    activeSection === sec
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {sec.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Active Section Form */}
            {activeSection === 'personal_info' && (
              <PersonalInfoForm
                data={content.personal_info || {}}
                onChange={(p) => handleContentChange({ ...content, personal_info: p })}
              />
            )}
            {activeSection === 'summary' && (
              <SummaryForm
                summary={content.summary || ''}
                targetRole={resume.target_role}
                onChange={(s) => handleContentChange({ ...content, summary: s })}
              />
            )}
            {activeSection === 'experience' && (
              <ExperienceForm
                items={content.experience || []}
                onChange={(exp) => handleContentChange({ ...content, experience: exp })}
              />
            )}
            {activeSection === 'education' && (
              <EducationForm
                items={content.education || []}
                onChange={(edu) => handleContentChange({ ...content, education: edu })}
              />
            )}
            {activeSection === 'skills' && (
              <SkillsForm
                categories={content.skills || []}
                targetRole={resume.target_role}
                onChange={(sk) => handleContentChange({ ...content, skills: sk })}
              />
            )}
            {activeSection === 'projects' && (
              <ProjectsForm
                items={content.projects || []}
                onChange={(proj) => handleContentChange({ ...content, projects: proj })}
              />
            )}
            {activeSection === 'certifications' && (
              <CertificationsForm
                items={content.certifications || []}
                onChange={(cert) => handleContentChange({ ...content, certifications: cert })}
              />
            )}
            {activeSection === 'achievements' && (
              <AchievementsForm
                items={content.achievements || []}
                onChange={(ach) => handleContentChange({ ...content, achievements: ach })}
              />
            )}
            {activeSection === 'languages' && (
              <LanguagesForm
                items={content.languages || []}
                onChange={(lang) => handleContentChange({ ...content, languages: lang })}
              />
            )}
            {activeSection === 'custom_sections' && (
              <CustomSectionsForm
                items={content.custom_sections || []}
                onChange={(custom) => handleContentChange({ ...content, custom_sections: custom })}
              />
            )}
          </div>
        </div>

        {/* Right Live Preview Column */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 ${
            activeMobileTab === 'edit' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="max-w-[800px] mx-auto sticky top-0 shadow-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <ResumeTemplateRenderer
              templateId={resume.template_id}
              content={content}
              themeColor={resume.theme_color}
              fontFamily={resume.font_family}
              fontSize={resume.font_size}
              spacing={resume.spacing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
