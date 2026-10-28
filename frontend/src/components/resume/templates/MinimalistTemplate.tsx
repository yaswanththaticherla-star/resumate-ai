import React from 'react';
import { ResumeContent } from '../../../types';

interface TemplateProps {
  content: ResumeContent;
  themeColor?: string;
  fontFamily?: string;
  fontSize?: string;
  spacing?: string;
}

export const MinimalistTemplate: React.FC<TemplateProps> = ({
  content,
  themeColor = '#334155',
  fontFamily = 'Inter',
  fontSize = 'medium',
  spacing = 'normal',
}) => {
  const p = content.personal_info || {};
  const isHidden = (sec: string) => content.hidden_sections?.includes(sec);

  return (
    <div
      className="w-full bg-white text-slate-800 p-8 sm:p-12 shadow-sm print:shadow-none print:p-0 text-[12px] leading-relaxed text-left"
      style={{ fontFamily }}
    >
      {/* Clean Minimalist Header */}
      {!isHidden('personal_info') && (
        <header className="mb-6 pb-6 border-b border-slate-200">
          <h1 className="text-3xl font-light tracking-tight text-slate-900">
            {p.full_name || 'Your Full Name'}
          </h1>
          {p.headline && (
            <p className="text-xs uppercase tracking-widest text-slate-500 font-medium mt-1">
              {p.headline}
            </p>
          )}

          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 mt-3 font-light">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.linkedin && <span>linkedin</span>}
            {p.github && <span>github</span>}
            {p.website && <span>portfolio</span>}
          </div>
        </header>
      )}

      <div className="space-y-6">
        {/* Summary */}
        {!isHidden('summary') && content.summary && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Profile
            </h2>
            <div className="md:col-span-3 text-slate-700 font-normal leading-relaxed">
              {content.summary}
            </div>
          </section>
        )}

        {/* Experience */}
        {!isHidden('experience') && content.experience && content.experience.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Experience
            </h2>
            <div className="md:col-span-3 space-y-5">
              {content.experience.map((job) => (
                <div key={job.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-slate-900 text-sm">
                      {job.role} <span className="text-slate-400 font-light">/ {job.company}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-light">
                      {job.start_date} – {job.current ? 'Present' : job.end_date}
                    </span>
                  </div>
                  {job.bullets && (
                    <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 text-xs">
                      {job.bullets.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {!isHidden('projects') && content.projects && content.projects.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Projects
            </h2>
            <div className="md:col-span-3 space-y-4">
              {content.projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between font-medium text-slate-900 text-xs">
                    <span>{proj.name}</span>
                    {proj.technologies && (
                      <span className="text-slate-400 text-[11px] font-light">
                        {proj.technologies.join(' · ')}
                      </span>
                    )}
                  </div>
                  {proj.description && <p className="text-slate-600 text-xs mt-0.5">{proj.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {!isHidden('skills') && content.skills && content.skills.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Skills
            </h2>
            <div className="md:col-span-3 space-y-2">
              {content.skills.map((cat) => (
                <div key={cat.id} className="text-xs">
                  <span className="text-slate-900 font-medium">{cat.name}: </span>
                  <span className="text-slate-600 font-light">{cat.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {!isHidden('education') && content.education && content.education.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Education
            </h2>
            <div className="md:col-span-3 space-y-2">
              {content.education.map((edu) => (
                <div key={edu.id} className="flex justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-900">{edu.degree} in {edu.field_of_study}</span>
                    <div className="text-slate-500 font-light">{edu.institution}</div>
                  </div>
                  <span className="text-slate-400 font-light">{edu.graduation_date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

