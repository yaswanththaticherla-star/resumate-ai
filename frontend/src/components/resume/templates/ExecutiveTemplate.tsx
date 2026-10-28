import React from 'react';
import { ResumeContent } from '../../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, ShieldCheck } from 'lucide-react';

interface TemplateProps {
  content: ResumeContent;
  themeColor?: string;
  fontFamily?: string;
  fontSize?: string;
  spacing?: string;
}

export const ExecutiveTemplate: React.FC<TemplateProps> = ({
  content,
  themeColor = '#0F172A',
  fontFamily = 'Merriweather',
  fontSize = 'medium',
  spacing = 'normal',
}) => {
  const p = content.personal_info || {};
  const isHidden = (sec: string) => content.hidden_sections?.includes(sec);

  return (
    <div
      className="w-full bg-white text-slate-800 shadow-sm print:shadow-none text-[12px] leading-relaxed text-left"
      style={{ fontFamily }}
    >
      {/* Executive Navy Header Bar */}
      {!isHidden('personal_info') && (
        <header className="bg-[#0B1528] text-white p-8 sm:p-10 border-b-4 border-indigo-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
                {p.full_name || 'Executive Name'}
              </h1>
              {p.headline && (
                <p className="text-xs uppercase tracking-widest text-indigo-300 font-sans font-semibold mt-1">
                  {p.headline}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:items-end gap-1 text-xs font-sans text-slate-300">
              {p.email && <span>{p.email}</span>}
              {p.phone && <span>{p.phone}</span>}
              {p.location && <span>{p.location}</span>}
              {p.linkedin && (
                <a href={p.linkedin} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                  LinkedIn Profile
                </a>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Body Content */}
      <div className="p-8 sm:p-10 space-y-6">
        {/* Executive Summary Callout Box */}
        {!isHidden('summary') && content.summary && (
          <section className="bg-slate-50 border-l-4 border-indigo-600 p-4 rounded-r-lg font-sans">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Executive Profile & Vision
            </h2>
            <p className="text-slate-700 leading-relaxed text-xs">
              {content.summary}
            </p>
          </section>
        )}

        {/* Leadership & Work Experience */}
        {!isHidden('experience') && content.experience && content.experience.length > 0 && (
          <section>
            <h2 className="text-xs font-serif font-bold uppercase tracking-wider pb-1 mb-3 border-b-2 border-slate-900 text-slate-900">
              Executive Leadership Experience
            </h2>
            <div className="space-y-4">
              {content.experience.map((job) => (
                <div key={job.id}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900 text-sm">
                    <span>
                      {job.role} <span className="font-normal font-sans text-slate-600">| {job.company}</span>
                    </span>
                    <span className="text-xs font-sans font-normal text-slate-500">
                      {job.start_date} – {job.current ? 'Present' : job.end_date}
                    </span>
                  </div>
                  {job.location && (
                    <div className="text-[11px] font-sans text-slate-500 italic mb-1">{job.location}</div>
                  )}
                  {job.bullets && (
                    <ul className="list-disc list-outside ml-4 space-y-1 font-sans text-slate-700 text-xs mt-1">
                      {job.bullets.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Core Competencies & Strategy */}
        {!isHidden('skills') && content.skills && content.skills.length > 0 && (
          <section>
            <h2 className="text-xs font-serif font-bold uppercase tracking-wider pb-1 mb-2 border-b-2 border-slate-900 text-slate-900">
              Core Strategic Competencies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
              {content.skills.map((cat) => (
                <div key={cat.id} className="text-xs">
                  <div className="font-bold text-slate-900 mb-0.5">{cat.name}:</div>
                  <div className="text-slate-600">{cat.skills.join(' • ')}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Board Governance */}
        {!isHidden('education') && content.education && content.education.length > 0 && (
          <section>
            <h2 className="text-xs font-serif font-bold uppercase tracking-wider pb-1 mb-2 border-b-2 border-slate-900 text-slate-900">
              Education & Academic Credentials
            </h2>
            <div className="space-y-2 font-sans text-xs">
              {content.education.map((edu) => (
                <div key={edu.id} className="flex justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree} in {edu.field_of_study}</span> — {edu.institution}
                  </div>
                  <span className="text-slate-500">{edu.graduation_date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

