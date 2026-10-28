import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Eye, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  LayoutTemplate,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { TemplateInfo, Resume } from '../types';
import { Modal } from '../components/common/Modal';
import { ResumeTemplateRenderer } from '../components/resume/templates/ResumeTemplateRenderer';
import { BackButton } from '../components/common/BackButton';

export const TemplateGalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  // Preview modal
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [applyingToResumeId, setApplyingToResumeId] = useState<number | null>(null);
  const [selectModalTemplate, setSelectModalTemplate] = useState<TemplateInfo | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [tplList, resList] = await Promise.all([
          api.listTemplates(),
          api.listResumes().catch(() => []),
        ]);
        setTemplates(tplList);
        setResumes(resList);
        if (resList.length > 0) {
          setApplyingToResumeId(resList[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleApplyTemplate = async (templateId: string) => {
    if (resumes.length === 0) {
      // Create new resume with this template
      try {
        const newResume = await api.createResume({
          title: 'My Professional Resume',
          template_id: templateId,
          theme_color: '#4F46E5',
        });
        navigate(`/editor/${newResume.id}`);
      } catch (e) {
        alert('Failed to initialize resume: ' + e);
      }
      return;
    }

    if (applyingToResumeId) {
      try {
        await api.updateResume(applyingToResumeId, { template_id: templateId });
        navigate(`/editor/${applyingToResumeId}`);
      } catch (e) {
        alert('Failed to apply template: ' + e);
      }
    } else {
      setSelectModalTemplate(templates.find((t) => t.id === templateId) || null);
    }
  };

  // Sample data for template preview
  const previewSampleContent = (resumes[0]?.content) || {
    personal_info: {
      full_name: 'Morgan Vance',
      headline: 'Senior Full-Stack Engineer',
      email: 'morgan.vance@example.com',
      phone: '+1 (555) 019-2834',
      location: 'San Francisco, CA',
      website: 'https://morgan.dev',
      linkedin: 'https://linkedin.com/in/morgan',
      github: 'https://github.com/morgan',
      avatar_url: '',
    },
    summary: 'Versatile Software Engineer with 5+ years of experience engineering scalable microservices and real-time React web applications. Passionate about clean code, automated testing, and performance optimization.',
    experience: [
      {
        id: '1',
        company: 'Vanguard Systems',
        role: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        start_date: '2022',
        end_date: 'Present',
        current: true,
        bullets: [
          'Architected high-throughput FastAPI microservices serving 100k+ daily users.',
          'Reduced web application latency by 35% through query optimization and caching.'
        ],
        technologies: ['FastAPI', 'React', 'Docker']
      }
    ],
    education: [
      {
        id: '1',
        institution: 'University of California',
        degree: 'Bachelor of Science',
        field_of_study: 'Computer Science',
        start_date: '2018',
        graduation_date: '2022',
        gpa: '3.85',
        honors: 'Cum Laude',
        coursework: ['Distributed Systems', 'Algorithms']
      }
    ],
    skills: [
      { id: '1', name: 'Languages & Tech', skills: ['Python', 'TypeScript', 'React', 'FastAPI', 'PostgreSQL', 'Docker'] }
    ],
    projects: [
      {
        id: '1',
        name: 'Telemetry Metrics Engine',
        description: 'Engineered a real-time event streaming pipeline processing 5M events/day.',
        role: 'Lead Architect',
        technologies: ['React', 'FastAPI', 'Redis'],
        outcomes: 'Achieved sub-second query latency.',
        repo_url: '',
        live_url: ''
      }
    ],
    certifications: [],
    achievements: [],
    languages: [],
    custom_sections: [],
    section_order: [],
    hidden_sections: []
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BackButton to="/dashboard" label="Back to Dashboard" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Recruiter-Approved Designs</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Resume Template Gallery
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose from 6 professionally crafted, ATS-compliant templates. Switching templates never loses your content.
          </p>
        </div>

        {/* Selected target resume dropdown */}
        {resumes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Apply to:
            </span>
            <select
              value={applyingToResumeId || ''}
              onChange={(e) => setApplyingToResumeId(parseInt(e.target.value, 10))}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden hover:shadow-lg transition-all group"
          >
            {/* Visual Thumbnail Representation */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 relative">
              <div className="bg-white rounded-lg shadow-sm p-4 h-48 overflow-hidden text-[8px] leading-tight text-slate-700 border border-slate-200 select-none pointer-events-none transform group-hover:scale-[1.01] transition-transform">
                {tpl.id === 'ats_classic' && (
                  <div className="text-center space-y-1">
                    <div className="font-bold text-[11px] text-slate-900">ALEX MORGAN</div>
                    <div className="text-[7px] text-slate-500 border-b pb-1">alex@dev.io • (555) 019-2834 • San Francisco, CA</div>
                    <div className="font-bold text-[8px] uppercase tracking-wider text-slate-800 text-left pt-1">EXPERIENCE</div>
                    <div className="text-left font-semibold">Senior Engineer | TechVanguard (2022-Pres)</div>
                    <div className="text-left text-slate-500">• Architected high throughput APIs with FastAPI.</div>
                    <div className="text-left text-slate-500">• Reduced page latency by 35%.</div>
                  </div>
                )}
                {tpl.id === 'modern_pro' && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline border-b-2 border-indigo-600 pb-1">
                      <div className="font-bold text-[11px] text-slate-900">ALEX MORGAN</div>
                      <div className="text-[7px] text-indigo-600 font-semibold">LEAD ENGINEER</div>
                    </div>
                    <div className="font-bold text-[8px] uppercase text-indigo-900 pt-1">Profile</div>
                    <div className="bg-indigo-50/50 p-1 rounded text-slate-600">High impact engineer delivering resilient systems.</div>
                    <div className="font-bold text-[8px] uppercase text-indigo-900 pt-1">Experience</div>
                    <div className="border-l border-indigo-500 pl-1 text-[7.5px]">Senior Engineer at Stripe • 2022-Pres</div>
                  </div>
                )}
                {tpl.id === 'software_dev' && (
                  <div className="space-y-1 font-mono">
                    <div className="flex items-center gap-1 border-b border-slate-900 pb-1">
                      <span className="text-indigo-600 font-bold">&gt;</span>
                      <span className="font-bold text-[10px] text-slate-900">alex_morgan.ts</span>
                    </div>
                    <div className="text-[7px] text-slate-500">// Stack: React, FastAPI, Docker, PG</div>
                    <div className="text-[7.5px] font-bold text-slate-800 pt-1">// Featured Projects</div>
                    <div className="border border-slate-200 p-1 rounded bg-slate-50 text-[7px]">
                      <span className="font-bold"># telemetry-pipeline</span> (5M events/day)
                    </div>
                  </div>
                )}
                {tpl.id === 'student_fresher' && (
                  <div className="space-y-1 text-center">
                    <div className="font-bold text-[11px] text-sky-800">JORDAN LEE</div>
                    <div className="text-[7px] text-slate-500 border-b border-sky-300 pb-1">B.S. in Computer Science • UC Berkeley</div>
                    <div className="font-bold text-[8px] uppercase text-sky-800 text-left pt-1">EDUCATION FIRST</div>
                    <div className="text-left font-semibold">UC Berkeley (GPA: 3.85 / 4.0)</div>
                    <div className="text-left text-slate-500">• Relevant: Distributed Systems, Algorithms</div>
                  </div>
                )}
                {tpl.id === 'minimalist' && (
                  <div className="space-y-1 text-left font-light">
                    <div className="text-[12px] text-slate-900 border-b border-slate-200 pb-1">Elena Rostova</div>
                    <div className="text-[7px] text-slate-400">elena@design.io · portfolio.dev</div>
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      <div className="text-[7px] text-slate-400 font-medium uppercase">Experience</div>
                      <div className="col-span-3 text-[7px] text-slate-700">Staff Architect / NextGen Systems</div>
                    </div>
                  </div>
                )}
                {tpl.id === 'executive' && (
                  <div className="space-y-1 text-left">
                    <div className="bg-[#0B1528] text-white p-2 rounded -mx-4 -mt-4 mb-2 flex justify-between items-center">
                      <div className="font-bold text-[10px]">VICTORIA STERLING</div>
                      <div className="text-[6.5px] text-indigo-300">VP OF ENGINEERING</div>
                    </div>
                    <div className="bg-slate-50 border-l-2 border-indigo-600 p-1 text-[7px] text-slate-700">
                      Executive vision driving $40M engineering portfolios.
                    </div>
                  </div>
                )}
              </div>

              {/* Badge on top corner */}
              <div className="absolute top-6 right-6">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-sm">
                  {tpl.badge}
                </span>
              </div>
            </div>

            {/* Template Information */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {tpl.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {tpl.description}
                </p>
                <div className="mt-3 text-[11px] text-slate-600 dark:text-slate-300">
                  <strong className="font-semibold text-slate-900 dark:text-white">Best for:</strong> {tpl.recommended_for}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewTemplateId(tpl.id)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(tpl.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Preview Modal */}
      <Modal
        isOpen={previewTemplateId !== null}
        onClose={() => setPreviewTemplateId(null)}
        title="Template Preview"
        subtitle="Review how your resume content renders in this design."
        maxWidth="2xl"
      >
        <div className="max-h-[70vh] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl shadow-inner">
          {previewTemplateId && (
            <ResumeTemplateRenderer
              templateId={previewTemplateId}
              content={previewSampleContent}
              themeColor="#4F46E5"
            />
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setPreviewTemplateId(null)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              if (previewTemplateId) handleApplyTemplate(previewTemplateId);
              setPreviewTemplateId(null);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/30"
          >
            Apply This Template
          </button>
        </div>
      </Modal>

      {/* Select Resume / Create New with Template Modal */}
      <Modal
        isOpen={selectModalTemplate !== null}
        onClose={() => setSelectModalTemplate(null)}
        title={`Apply ${selectModalTemplate?.name || 'Template'}`}
        subtitle="Select which resume should use this template, or create a brand new resume."
      >
        <div className="space-y-4 text-left">
          {resumes.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Apply to existing resume:
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {resumes.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={async () => {
                      if (!selectModalTemplate) return;
                      await api.updateResume(r.id, { template_id: selectModalTemplate.id });
                      setSelectModalTemplate(null);
                      navigate(`/editor/${r.id}`);
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 flex items-center justify-between text-left transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{r.title}</p>
                      <p className="text-[11px] text-slate-500">Updated {new Date(r.updated_at).toLocaleDateString()}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={async () => {
                if (!selectModalTemplate) return;
                const newRes = await api.createResume({
                  title: `${selectModalTemplate.name} Resume`,
                  template_id: selectModalTemplate.id,
                });
                setSelectModalTemplate(null);
                navigate(`/editor/${newRes.id}`);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create New Resume with {selectModalTemplate?.name}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

