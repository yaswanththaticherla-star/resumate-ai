import React from 'react';
import { ResumeContent } from '../../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface TemplateProps {
  content: ResumeContent;
  themeColor?: string;
  fontFamily?: string;
  fontSize?: string;
  spacing?: string;
}

export const ATSClassicTemplate: React.FC<TemplateProps> = ({
  content,
  themeColor = '#1E293B',
  fontFamily = 'Inter',
  fontSize = 'medium',
  spacing = 'normal',
}) => {
  const p = content.personal_info || {};
  const isHidden = (sec: string) => content.hidden_sections?.includes(sec);

  const fontSizeClass = {
    small: 'text-[11px] leading-relaxed',
    medium: 'text-[12px] leading-relaxed',
    large: 'text-[13px] leading-normal',
  }[fontSize] || 'text-[12px] leading-relaxed';

  const spacingClass = {
    compact: 'space-y-3',
    normal: 'space-y-4',
    relaxed: 'space-y-5',
  }[spacing] || 'space-y-4';

  return (
    <div
      className={`w-full bg-white text-slate-900 p-8 sm:p-10 shadow-sm print:shadow-none print:p-0 ${fontSizeClass}`}
      style={{ fontFamily }}
    >
      {/* Header: Personal Info */}
      {!isHidden('personal_info') && (
        <header className="border-b-2 pb-4 mb-4 text-center" style={{ borderColor: themeColor }}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase">
            {p.full_name || 'Your Full Name'}
          </h1>
          {p.headline && (
            <p className="text-sm font-semibold mt-1" style={{ color: themeColor }}>
              {p.headline}
            </p>
          )}

          {/* Contact Details Line */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-600">
            {p.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                <a href={`mailto:${p.email}`} className="hover:underline">{p.email}</a>
              </span>
            )}
            {p.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{p.phone}</span>
              </span>
            )}
            {p.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{p.location}</span>
              </span>
            )}
            {p.linkedin && (
              <span className="flex items-center gap-1">
                <Linkedin className="w-3 h-3 text-slate-400" />
                <a href={p.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                  LinkedIn
                </a>
              </span>
            )}
            {p.github && (
              <span className="flex items-center gap-1">
                <Github className="w-3 h-3 text-slate-400" />
                <a href={p.github} target="_blank" rel="noreferrer" className="hover:underline">
                  GitHub
                </a>
              </span>
            )}
            {p.website && (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-400" />
                <a href={p.website} target="_blank" rel="noreferrer" className="hover:underline">
                  Portfolio
                </a>
              </span>
            )}
          </div>
        </header>
      )}

      <div className={spacingClass}>
        {/* Professional Summary */}
        {!isHidden('summary') && content.summary && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-300"
              style={{ color: themeColor }}
            >
              Professional Summary
            </h2>
            <p className="text-slate-700 text-justify">{content.summary}</p>
          </section>
        )}

        {/* Work Experience */}
        {!isHidden('experience') && content.experience && content.experience.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-300"
              style={{ color: themeColor }}
            >
              Professional Experience
            </h2>
            <div className="space-y-3">
              {content.experience.map((job) => (
                <div key={job.id} className="text-left">
                  <div className="flex justify-between items-baseline font-semibold text-slate-900">
                    <span className="text-sm">
                      {job.role} <span className="font-normal text-slate-600">| {job.company}</span>
                    </span>
                    <span className="text-xs text-slate-500 font-normal">
                      {job.start_date} – {job.current ? 'Present' : job.end_date}
                    </span>
                  </div>
                  {job.location && (
                    <div className="text-[11px] text-slate-500 italic mb-1">{job.location}</div>
                  )}
                  {job.bullets && job.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700">
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

        {/* Technical Skills */}
        {!isHidden('skills') && content.skills && content.skills.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-300"
              style={{ color: themeColor }}
            >
              Technical & Professional Skills
            </h2>
            <div className="space-y-1.5 text-left">
              {content.skills.map((cat) => (
                <div key={cat.id} className="flex flex-col sm:flex-row sm:items-baseline">
                  <span className="font-semibold text-slate-800 w-44 flex-shrink-0 text-xs">
                    {cat.name}:
                  </span>
                  <span className="text-slate-700 flex-1">
                    {cat.skills.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {!isHidden('projects') && content.projects && content.projects.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-300"
              style={{ color: themeColor }}
            >
              Key Projects
            </h2>
            <div className="space-y-2.5">
              {content.projects.map((proj) => (
                <div key={proj.id} className="text-left">
                  <div className="flex justify-between items-baseline font-semibold text-slate-900 text-sm">
                    <span>
                      {proj.name}
                      {proj.role && <span className="font-normal text-slate-600"> — {proj.role}</span>}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-normal">
                      {proj.live_url && (
                        <a href={proj.live_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                          Live Demo
                        </a>
                      )}
                      {proj.repo_url && (
                        <a href={proj.repo_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                          Code
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      Tech: {proj.technologies.join(', ')}
                    </div>
                  )}
                  {proj.description && <p className="text-slate-700 mt-0.5">{proj.description}</p>}
                  {proj.outcomes && (
                    <p className="text-slate-700 italic text-[11px] mt-0.5">
                      Impact: {proj.outcomes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {!isHidden('education') && content.education && content.education.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-300"
              style={{ color: themeColor }}
            >
              Education
            </h2>
            <div className="space-y-2">
              {content.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline text-left">
                  <div>
                    <span className="font-semibold text-slate-900 text-sm">
                      {edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}
                    </span>
                    <div className="text-slate-700 text-xs">{edu.institution}</div>
                    {edu.gpa && <div className="text-[11px] text-slate-500">GPA: {edu.gpa}</div>}
                  </div>
                  <div className="text-xs text-slate-500 text-right">
                    {edu.graduation_date || `${edu.start_date} – ${edu.graduation_date}`}
                    {edu.honors && <div className="italic text-slate-600">{edu.honors}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {!isHidden('certifications') && content.certifications && content.certifications.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-300"
              style={{ color: themeColor }}
            >
              Certifications & Credentials
            </h2>
            <div className="space-y-1 text-left">
              {content.certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between text-xs">
                  <span className="font-medium text-slate-900">
                    {cert.name} — <span className="text-slate-600 font-normal">{cert.issuer}</span>
                  </span>
                  <span className="text-slate-500">{cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {!isHidden('achievements') && content.achievements && content.achievements.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-300"
              style={{ color: themeColor }}
            >
              Honors & Achievements
            </h2>
            <div className="space-y-1.5 text-left">
              {content.achievements.map((ach) => (
                <div key={ach.id}>
                  <div className="flex justify-between font-semibold text-slate-900 text-xs">
                    <span>{ach.title}</span>
                    <span className="text-slate-500 font-normal">{ach.date}</span>
                  </div>
                  {ach.description && <p className="text-slate-700 text-[11px]">{ach.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {!isHidden('languages') && content.languages && content.languages.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-300"
              style={{ color: themeColor }}
            >
              Languages
            </h2>
            <div className="flex flex-wrap gap-4 text-xs">
              {content.languages.map((l) => (
                <span key={l.id} className="text-slate-800">
                  <strong className="font-semibold">{l.language}:</strong> {l.proficiency}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

