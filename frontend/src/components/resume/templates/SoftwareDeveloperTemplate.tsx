import React from 'react';
import { ResumeContent } from '../../../types';
import { Terminal, Github, Globe, Mail, Phone, MapPin, ExternalLink, Code2 } from 'lucide-react';

interface TemplateProps {
  content: ResumeContent;
  themeColor?: string;
  fontFamily?: string;
  fontSize?: string;
  spacing?: string;
}

export const SoftwareDeveloperTemplate: React.FC<TemplateProps> = ({
  content,
  themeColor = '#0F172A',
  fontFamily = 'Inter',
  fontSize = 'medium',
  spacing = 'normal',
}) => {
  const p = content.personal_info || {};
  const isHidden = (sec: string) => content.hidden_sections?.includes(sec);

  return (
    <div
      className="w-full bg-white text-slate-900 p-8 sm:p-10 shadow-sm print:shadow-none print:p-0 text-[12px] leading-relaxed text-left"
      style={{ fontFamily }}
    >
      {/* Dev Header */}
      {!isHidden('personal_info') && (
        <header className="border-b-2 border-slate-900 pb-4 mb-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600" />
                <h1 className="text-2xl font-mono font-bold tracking-tight text-slate-900">
                  {p.full_name || 'Software Engineer'}
                </h1>
              </div>
              {p.headline && (
                <p className="font-mono text-xs text-indigo-600 font-semibold mt-0.5">
                  &gt; {p.headline}
                </p>
              )}
            </div>

            <div className="flex flex-wrap sm:flex-col sm:items-end gap-1.5 text-xs font-mono text-slate-600">
              {p.email && (
                <a href={`mailto:${p.email}`} className="hover:text-indigo-600 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {p.email}
                </a>
              )}
              {p.github && (
                <a href={p.github} target="_blank" rel="noreferrer" className="hover:text-indigo-600 flex items-center gap-1">
                  <Github className="w-3 h-3" /> github.com
                </a>
              )}
              {p.website && (
                <a href={p.website} target="_blank" rel="noreferrer" className="hover:text-indigo-600 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> demo/portfolio
                </a>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Dev Layout */}
      <div className="space-y-4">
        {/* Core Summary */}
        {!isHidden('summary') && content.summary && (
          <section>
            <div className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span className="text-indigo-600">//</span> About & Core Competencies
            </div>
            <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
              {content.summary}
            </p>
          </section>
        )}

        {/* Skills Grid */}
        {!isHidden('skills') && content.skills && content.skills.length > 0 && (
          <section>
            <div className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="text-indigo-600">//</span> Technical Toolchain
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {content.skills.map((cat) => (
                <div key={cat.id} className="p-2 border border-slate-200 rounded bg-slate-50/50">
                  <div className="font-mono text-[11px] font-bold text-slate-800 mb-1">{cat.name}:</div>
                  <div className="flex flex-wrap gap-1">
                    {cat.skills.map((s, i) => (
                      <span key={i} className="font-mono text-[10px] bg-white border border-slate-300 text-slate-800 px-1.5 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects First for Developers */}
        {!isHidden('projects') && content.projects && content.projects.length > 0 && (
          <section>
            <div className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="text-indigo-600">//</span> Featured Engineering Projects
            </div>
            <div className="space-y-2.5">
              {content.projects.map((proj) => (
                <div key={proj.id} className="border border-slate-200 rounded p-2.5 bg-white">
                  <div className="flex justify-between items-baseline font-mono text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                      {proj.name}
                      {proj.role && <span className="font-sans font-normal text-slate-500 text-[11px]"> ({proj.role})</span>}
                    </span>
                    <div className="flex items-center gap-2 font-sans font-normal">
                      {proj.repo_url && (
                        <a href={proj.repo_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-0.5">
                          Source <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {proj.live_url && (
                        <a href={proj.live_url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center gap-0.5">
                          Deploy <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 font-mono text-[10px] text-slate-600">
                      {proj.technologies.map((t, idx) => (
                        <span key={idx} className="bg-slate-100 px-1 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.description && <p className="text-slate-700 text-xs mt-1">{proj.description}</p>}
                  {proj.outcomes && (
                    <p className="text-slate-800 font-mono text-[11px] mt-0.5 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                      &gt; Impact: {proj.outcomes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {!isHidden('experience') && content.experience && content.experience.length > 0 && (
          <section>
            <div className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="text-indigo-600">//</span> Work History
            </div>
            <div className="space-y-3">
              {content.experience.map((job) => (
                <div key={job.id}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                    <span>
                      {job.role} <span className="font-mono font-normal text-slate-600">@ {job.company}</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 font-normal">
                      {job.start_date} – {job.current ? 'Present' : job.end_date}
                    </span>
                  </div>
                  {job.bullets && job.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 mt-1">
                      {job.bullets.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {!isHidden('education') && content.education && content.education.length > 0 && (
          <section>
            <div className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span className="text-indigo-600">//</span> Education
            </div>
            <div className="space-y-1 text-xs">
              {content.education.map((edu) => (
                <div key={edu.id} className="flex justify-between">
                  <div>
                    <span className="font-semibold text-slate-900">{edu.degree} in {edu.field_of_study}</span> — {edu.institution}
                  </div>
                  <span className="font-mono text-slate-500">{edu.graduation_date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

