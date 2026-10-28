import React from 'react';
import { ResumeContent } from '../../../types';
import { GraduationCap, Award, BookOpen, Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface TemplateProps {
  content: ResumeContent;
  themeColor?: string;
  fontFamily?: string;
  fontSize?: string;
  spacing?: string;
}

export const StudentFresherTemplate: React.FC<TemplateProps> = ({
  content,
  themeColor = '#0284C7', // Sky Blue / Cyan
  fontFamily = 'Inter',
  fontSize = 'medium',
  spacing = 'normal',
}) => {
  const p = content.personal_info || {};
  const isHidden = (sec: string) => content.hidden_sections?.includes(sec);

  return (
    <div
      className="w-full bg-white text-slate-800 p-8 sm:p-10 shadow-sm print:shadow-none print:p-0 text-[12px] leading-relaxed text-left"
      style={{ fontFamily }}
    >
      {/* Header */}
      {!isHidden('personal_info') && (
        <header className="border-b-2 pb-4 mb-4 text-center" style={{ borderColor: themeColor }}>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {p.full_name || 'Student / Graduate Name'}
          </h1>
          {p.headline && (
            <p className="text-sm font-semibold mt-0.5 text-sky-700">
              {p.headline}
            </p>
          )}

          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>• {p.phone}</span>}
            {p.location && <span>• {p.location}</span>}
            {p.linkedin && (
              <span>• <a href={p.linkedin} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">LinkedIn</a></span>
            )}
            {p.github && (
              <span>• <a href={p.github} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">GitHub</a></span>
            )}
          </div>
        </header>
      )}

      <div className="space-y-4">
        {/* Education Front & Center */}
        {!isHidden('education') && content.education && content.education.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 font-bold uppercase text-xs tracking-wider pb-1 mb-2 border-b border-sky-200 text-sky-800">
              <GraduationCap className="w-4 h-4 text-sky-600" />
              <span>Education</span>
            </div>
            <div className="space-y-3">
              {content.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900 text-sm">
                    <span>{edu.institution}</span>
                    <span className="text-xs font-normal text-slate-500">
                      {edu.graduation_date || `${edu.start_date} – ${edu.graduation_date}`}
                    </span>
                  </div>
                  <div className="text-slate-700 font-medium text-xs">
                    {edu.degree} in {edu.field_of_study}
                    {edu.gpa && <span className="ml-2 font-semibold text-sky-700">| GPA: {edu.gpa}</span>}
                  </div>
                  {edu.honors && <div className="text-slate-600 text-[11px] italic mt-0.5">Honors: {edu.honors}</div>}
                  {edu.coursework && edu.coursework.length > 0 && (
                    <div className="text-[11px] text-slate-600 mt-1">
                      <strong>Relevant Coursework:</strong> {edu.coursework.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Skills */}
        {!isHidden('skills') && content.skills && content.skills.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 font-bold uppercase text-xs tracking-wider pb-1 mb-2 border-b border-sky-200 text-sky-800">
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span>Technical Skills</span>
            </div>
            <div className="space-y-1">
              {content.skills.map((cat) => (
                <div key={cat.id} className="text-xs">
                  <strong className="text-slate-900">{cat.name}: </strong>
                  <span className="text-slate-700">{cat.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Academic & Personal Projects */}
        {!isHidden('projects') && content.projects && content.projects.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 font-bold uppercase text-xs tracking-wider pb-1 mb-2 border-b border-sky-200 text-sky-800">
              <Award className="w-4 h-4 text-sky-600" />
              <span>Academic & Capstone Projects</span>
            </div>
            <div className="space-y-2.5">
              {content.projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                    <span>
                      {proj.name}
                      {proj.role && <span className="font-normal text-slate-500"> ({proj.role})</span>}
                    </span>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="text-[11px] font-normal text-sky-700">
                        [{proj.technologies.join(', ')}]
                      </span>
                    )}
                  </div>
                  {proj.description && <p className="text-slate-700 text-xs mt-0.5">{proj.description}</p>}
                  {proj.outcomes && (
                    <p className="text-slate-600 italic text-[11px] mt-0.5">
                      Key Takeaway: {proj.outcomes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience / Internships */}
        {!isHidden('experience') && content.experience && content.experience.length > 0 && (
          <section>
            <div className="font-bold uppercase text-xs tracking-wider pb-1 mb-2 border-b border-sky-200 text-sky-800">
              Internships & Work Experience
            </div>
            <div className="space-y-3">
              {content.experience.map((job) => (
                <div key={job.id}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                    <span>{job.role} — {job.company}</span>
                    <span className="text-slate-500 font-normal">{job.start_date} – {job.current ? 'Present' : job.end_date}</span>
                  </div>
                  {job.bullets && (
                    <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 mt-1">
                      {job.bullets.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications & Achievements */}
        {!isHidden('achievements') && content.achievements && content.achievements.length > 0 && (
          <section>
            <div className="font-bold uppercase text-xs tracking-wider pb-1 mb-2 border-b border-sky-200 text-sky-800">
              Honors & Leadership Activities
            </div>
            <div className="space-y-1 text-xs">
              {content.achievements.map((a) => (
                <div key={a.id}>
                  <span className="font-semibold text-slate-900">{a.title}</span> {a.date && `(${a.date})`}: {a.description}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

