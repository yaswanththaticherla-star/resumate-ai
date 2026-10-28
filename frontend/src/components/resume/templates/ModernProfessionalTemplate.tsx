import React from 'react';
import { ResumeContent } from '../../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, ExternalLink } from 'lucide-react';

interface TemplateProps {
  content: ResumeContent;
  themeColor?: string;
  fontFamily?: string;
  fontSize?: string;
  spacing?: string;
}

export const ModernProfessionalTemplate: React.FC<TemplateProps> = ({
  content,
  themeColor = '#4F46E5',
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

  return (
    <div
      className={`w-full bg-white text-slate-800 p-8 sm:p-10 shadow-sm print:shadow-none print:p-0 ${fontSizeClass}`}
      style={{ fontFamily }}
    >
      {/* Modern Two-Tone Top Banner */}
      {!isHidden('personal_info') && (
        <header className="border-b-2 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ borderColor: themeColor }}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {p.full_name || 'Your Full Name'}
            </h1>
            {p.headline && (
              <p className="text-sm font-semibold tracking-wide mt-1 uppercase" style={{ color: themeColor }}>
                {p.headline}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:items-end gap-1 text-xs text-slate-600">
            {p.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <a href={`mailto:${p.email}`} className="hover:underline">{p.email}</a>
              </div>
            )}
            {p.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{p.phone}</span>
              </div>
            )}
            {p.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{p.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              {p.linkedin && (
                <a href={p.linkedin} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-600">
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              )}
              {p.github && (
                <a href={p.github} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-600">
                  <Github className="w-3.5 h-3.5" />
                </a>
              )}
              {p.website && (
                <a href={p.website} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-600">
                  <Globe className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </header>
      )}

      <div className="space-y-5 text-left">
        {/* Professional Summary */}
        {!isHidden('summary') && content.summary && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-4 w-1 rounded-full" style={{ backgroundColor: themeColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Executive Profile
              </h2>
            </div>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 text-justify">
              {content.summary}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {!isHidden('experience') && content.experience && content.experience.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-4 w-1 rounded-full" style={{ backgroundColor: themeColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Experience
              </h2>
            </div>
            <div className="space-y-4">
              {content.experience.map((job) => (
                <div key={job.id} className="relative pl-4 border-l-2 border-slate-200">
                  <div
                    className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full"
                    style={{ backgroundColor: themeColor }}
                  />
                  <div className="flex flex-wrap justify-between items-baseline">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {job.role} <span className="font-normal text-slate-600">at {job.company}</span>
                    </h3>
                    <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {job.start_date} — {job.current ? 'Present' : job.end_date}
                    </span>
                  </div>
                  {job.location && <div className="text-[11px] text-slate-500 mb-1">{job.location}</div>}
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

        {/* Skills */}
        {!isHidden('skills') && content.skills && content.skills.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-4 w-1 rounded-full" style={{ backgroundColor: themeColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Skills & Competencies
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {content.skills.map((cat) => (
                <div key={cat.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                  <span className="font-bold text-slate-900 text-[11px] block mb-1">
                    {cat.name}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cat.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-white border border-slate-200 text-slate-700 text-[10.5px] px-2 py-0.5 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Key Projects */}
        {!isHidden('projects') && content.projects && content.projects.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-4 w-1 rounded-full" style={{ backgroundColor: themeColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Projects
              </h2>
            </div>
            <div className="space-y-3">
              {content.projects.map((proj) => (
                <div key={proj.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/40">
                  <div className="flex justify-between items-baseline font-bold text-slate-900 text-sm">
                    <span>
                      {proj.name}
                      {proj.role && <span className="font-normal text-slate-500 text-xs"> ({proj.role})</span>}
                    </span>
                    <div className="flex gap-2 text-xs font-normal">
                      {proj.live_url && (
                        <a href={proj.live_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                          Live <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <strong>Stack:</strong> {proj.technologies.join(', ')}
                    </div>
                  )}
                  {proj.description && <p className="text-slate-700 text-xs mt-1">{proj.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Certifications Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!isHidden('education') && content.education && content.education.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-4 w-1 rounded-full" style={{ backgroundColor: themeColor }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Education
                </h2>
              </div>
              <div className="space-y-2">
                {content.education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-700">{edu.institution}</div>
                    <div className="text-slate-500 text-[11px]">
                      {edu.graduation_date} {edu.gpa && `• GPA: ${edu.gpa}`}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!isHidden('certifications') && content.certifications && content.certifications.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-4 w-1 rounded-full" style={{ backgroundColor: themeColor }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Certifications
                </h2>
              </div>
              <div className="space-y-2 text-xs">
                {content.certifications.map((cert) => (
                  <div key={cert.id}>
                    <div className="font-semibold text-slate-900">{cert.name}</div>
                    <div className="text-slate-600 text-[11px]">{cert.issuer} • {cert.date}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

