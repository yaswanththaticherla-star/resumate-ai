import { 
  Resume, 
  ResumeContent, 
  ATSResult, 
  JobMatchResult, 
  CoverLetter, 
  JobApplication, 
  User, 
  TemplateInfo,
  AISuggestion,
  ATSIssue 
} from '../types';

const STORAGE_KEYS = {
  USER: 'resumate_local_user',
  RESUMES: 'resumate_local_resumes',
  COVER_LETTERS: 'resumate_local_cover_letters',
  APPLICATIONS: 'resumate_local_applications',
  JOB_MATCH_HISTORY: 'resumate_local_job_matches',
};

// Default Starter User for immediate zero-config testing
export const DEFAULT_USER: User = {
  id: 1,
  email: 'alex.morgan@resumate.ai',
  full_name: 'Alex Morgan',
  headline: 'Senior Full-Stack Software Engineer',
  avatar_url: '',
  theme_preference: 'system',
  default_template: 'ats_classic',
  created_at: new Date().toISOString(),
};

// Default Starter Resume with rich authentic content across all sections
export const DEFAULT_RESUME_CONTENT: ResumeContent = {
  personal_info: {
    full_name: 'Alex Morgan',
    headline: 'Senior Full-Stack Software Engineer',
    email: 'alex.morgan@resumate.ai',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    website: 'https://alexmorgan.dev',
    linkedin: 'https://linkedin.com/in/alexmorgan',
    github: 'https://github.com/alexmorgan',
    avatar_url: '',
  },
  summary: 'Results-driven Senior Full-Stack Engineer with 5+ years of experience architecting high-throughput distributed APIs and real-time React web applications. Proven track record in reducing API latency by 35%, streamlining automated CI/CD pipelines, and leading agile engineering teams.',
  experience: [
    {
      id: 'exp-1',
      company: 'TechVanguard Solutions',
      role: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      start_date: '2022-01',
      end_date: 'Present',
      current: true,
      bullets: [
        'Architected high-throughput RESTful APIs using FastAPI and PostgreSQL, serving 120,000+ daily active users.',
        'Engineered real-time collaboration dashboards in React and TypeScript, decreasing page load time by 34%.',
        'Streamlined automated CI/CD pipelines via GitHub Actions, reducing deployment turnaround from 45 to 8 minutes.',
        'Mentored 4 junior engineers on clean architecture, unit testing patterns, and code review standards.'
      ],
      technologies: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'],
    },
    {
      id: 'exp-2',
      company: 'CloudScale Technologies',
      role: 'Full-Stack Developer',
      location: 'San Jose, CA',
      start_date: '2019-06',
      end_date: '2021-12',
      current: false,
      bullets: [
        'Developed customer-facing responsive micro-frontends handling 50k+ daily transactions.',
        'Optimized PostgreSQL query indexing and caching with Redis, reducing database CPU load by 40%.',
        'Implemented comprehensive integration tests achieving 92% code coverage across core billing services.'
      ],
      technologies: ['React', 'Node.js', 'Express', 'Redis', 'PostgreSQL'],
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field_of_study: 'Computer Science',
      start_date: '2015-09',
      graduation_date: '2019-05',
      gpa: '3.85 / 4.0',
      honors: "Dean's Honors List",
      coursework: ['Data Structures', 'Algorithms', 'Distributed Systems', 'Database Architecture', 'Cloud Computing'],
    }
  ],
  skills: [
    {
      id: 'skill-1',
      name: 'Languages & Frameworks',
      skills: ['TypeScript', 'JavaScript', 'Python', 'React', 'Node.js', 'FastAPI', 'Tailwind CSS', 'SQL'],
    },
    {
      id: 'skill-2',
      name: 'Cloud & Infrastructure',
      skills: ['AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'CI/CD', 'Git', 'Linux'],
    },
    {
      id: 'skill-3',
      name: 'Engineering Practices',
      skills: ['RESTful APIs', 'Microservices', 'System Design', 'Agile/Scrum', 'Test-Driven Development'],
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'CloudMetrics Observability Platform',
      description: 'Distributed metrics dashboard visualizing system health, p99 latencies, and error rates in real-time.',
      role: 'Lead Architect',
      technologies: ['React', 'TypeScript', 'Go', 'Prometheus', 'Tailwind CSS'],
      outcomes: 'Adopted by 15 internal squads, catching 12 production regressions within the first month.',
      repo_url: 'https://github.com/alexmorgan/cloudmetrics',
      live_url: 'https://cloudmetrics.demo.io',
    },
    {
      id: 'proj-2',
      name: 'DevFlow Task Orchestrator',
      description: 'Lightweight asynchronous job queue and task scheduler with web-based kanban management.',
      role: 'Sole Developer',
      technologies: ['React', 'Python', 'PostgreSQL', 'Tailwind CSS'],
      outcomes: 'Gained 400+ GitHub stars and reduced operational background job failures by 60%.',
      repo_url: 'https://github.com/alexmorgan/devflow',
      live_url: 'https://devflow.demo.io',
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      date: '2023-08',
      expiry_date: '2026-08',
      credential_id: 'AWS-091823',
      credential_url: 'https://aws.amazon.com/verification',
    }
  ],
  achievements: [
    {
      id: 'ach-1',
      title: 'First Place – National Collegiate Hackathon',
      description: 'Built an AI-assisted accessibility reader for visually impaired students among 80+ participating teams.',
      date: '2018-11',
    }
  ],
  languages: [
    { id: 'lang-1', language: 'English', proficiency: 'Native' },
    { id: 'lang-2', language: 'Spanish', proficiency: 'Intermediate' },
  ],
  custom_sections: [
    {
      id: 'custom-1',
      title: 'Publications & Speaking',
      content: 'Speaker at Silicon Valley Full-Stack Meetup 2023 on "Building Resilient Event-Driven Microservices in Python & React".',
    }
  ],
  section_order: [
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
  ],
  hidden_sections: [],
};

export const DEFAULT_RESUME: Resume = {
  id: 1,
  user_id: 1,
  title: 'Full-Stack Software Engineer',
  template_id: 'ats_classic',
  theme_color: '#4F46E5',
  font_family: 'Inter',
  font_size: 'medium',
  spacing: 'normal',
  is_public: false,
  share_token: 'demo-share-token-123',
  target_role: 'Senior Full-Stack Engineer',
  ats_score: 92,
  content: DEFAULT_RESUME_CONTENT,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const TEMPLATES_DATA: TemplateInfo[] = [
  {
    id: 'ats_classic',
    name: 'ATS Classic',
    category: 'ats_friendly',
    description: 'Clean single-column layout optimized for ATS parsers and technical hiring managers.',
    badge: 'High ATS Match',
    recommended_for: 'Software Engineers, Technical Roles, Corporate Applicants',
    layout: 'Single-column structured with clear section headers',
    features: ['100% ATS Readable', 'Standard font pairings', 'Section borders', 'Scannable hierarchy'],
  },
  {
    id: 'modern_minimal',
    name: 'Modern Minimal',
    category: 'modern',
    description: 'Sleek, uncluttered typography with modern whitespace and subtle accent accents.',
    badge: 'Popular',
    recommended_for: 'Product Managers, UI/UX Designers, Technology Consultants',
    layout: 'Clean header with breathable two-tier content hierarchy',
    features: ['Modern typography', 'Subtle dividing lines', 'High legibility', 'Compact skills pill list'],
  },
  {
    id: 'executive',
    name: 'Executive Elite',
    category: 'executive',
    description: 'Sophisticated header with navy accents designed for senior leadership and directors.',
    badge: 'Leadership',
    recommended_for: 'Engineering Managers, VP of Product, Directors, Executives',
    layout: 'Commanding header with executive summary callout',
    features: ['Authoritative styling', 'Strategic summary highlight', 'Key metrics focus'],
  },
  {
    id: 'creative_sidebar',
    name: 'Creative Sidebar',
    category: 'creative',
    description: 'Two-column design with a distinct left sidebar for skills, contact, and certifications.',
    badge: 'Designer Choice',
    recommended_for: 'Designers, Marketing Specialists, Frontend Engineers',
    layout: 'Two-column asymmetrical grid with left sidebar',
    features: ['Eye-catching layout', 'Left rail for quick scanning', 'Visual contact badges'],
  },
  {
    id: 'tech_stack',
    name: 'Tech Stack Focused',
    category: 'tech',
    description: 'Emphasizes technical competencies, code repositories, and project outcomes upfront.',
    badge: 'Developer Favorite',
    recommended_for: 'Full-Stack Developers, DevOps, Data Engineers',
    layout: 'Technical skills front and center with project metrics highlight',
    features: ['Tech tags on experience', 'Repo links integration', 'System design focus'],
  },
  {
    id: 'corporate',
    name: 'Corporate Standard',
    category: 'corporate',
    description: 'Traditional formal layout favored by Fortune 500 enterprises, banks, and consultancies.',
    badge: 'Traditional',
    recommended_for: 'Financial Analysts, Management Consultants, Enterprise Roles',
    layout: 'Traditional serif/sans-serif hybrid single column',
    features: ['Conservative layout', 'Universal ATS compatibility', 'Formal date formatting'],
  },
  {
    id: 'academic',
    name: 'Academic CV',
    category: 'academic',
    description: 'Designed for research, publications, conference presentations, and higher education.',
    badge: 'Academic',
    recommended_for: 'Researchers, PhD Candidates, Professors, Scientists',
    layout: 'Extended single-column with multi-page optimization',
    features: ['Publications section', 'Research coursework', 'Grants and fellowships support'],
  },
  {
    id: 'sleek_compact',
    name: 'Sleek Compact',
    category: 'modern',
    description: 'Dense one-page layout engineered to fit maximum relevant content without crowding.',
    badge: 'Space Saver',
    recommended_for: 'Early Career, Mid-Level Engineers with rich experience',
    layout: 'High-density grid with tight margins and compact line spacing',
    features: ['Strict 1-page fit', 'Inline dates and roles', 'Compact bullet styling'],
  },
];

// Local storage management helpers
export const localStore = {
  getUser: (): User => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) return JSON.parse(stored);
    } catch {}
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  },

  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  updateProfile: (data: Partial<User>): User => {
    const current = localStore.getUser();
    const updated = { ...current, ...data };
    localStore.setUser(updated);
    return updated;
  },

  getResumes: (): Resume[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESUMES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    const initial = [DEFAULT_RESUME];
    localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(initial));
    return initial;
  },

  saveResumes: (resumes: Resume[]) => {
    localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(resumes));
  },

  getResumeById: (id: number): Resume => {
    const list = localStore.getResumes();
    const found = list.find((r) => r.id === id);
    if (found) return found;
    return list[0] || DEFAULT_RESUME;
  },

  createResume: (data: Partial<Resume>): Resume => {
    const list = localStore.getResumes();
    const newId = list.length > 0 ? Math.max(...list.map((r) => r.id)) + 1 : 1;
    const newResume: Resume = {
      id: newId,
      user_id: 1,
      title: data.title || 'Untitled Resume',
      template_id: data.template_id || 'ats_classic',
      theme_color: data.theme_color || '#4F46E5',
      font_family: data.font_family || 'Inter',
      font_size: data.font_size || 'medium',
      spacing: data.spacing || 'normal',
      is_public: false,
      share_token: `share-${Date.now()}`,
      target_role: data.target_role || 'Software Engineer',
      ats_score: 88,
      content: (data.content as any) || DEFAULT_RESUME_CONTENT,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.unshift(newResume);
    localStore.saveResumes(list);
    return newResume;
  },

  updateResume: (id: number, data: Partial<Resume>): Resume => {
    const list = localStore.getResumes();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) {
      return localStore.createResume(data);
    }
    const current = list[idx];
    const updated: Resume = {
      ...current,
      ...data,
      content: (data.content as any) || current.content,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    localStore.saveResumes(list);
    return updated;
  },

  deleteResume: (id: number) => {
    let list = localStore.getResumes();
    list = list.filter((r) => r.id !== id);
    if (list.length === 0) {
      list = [DEFAULT_RESUME];
    }
    localStore.saveResumes(list);
    return { message: 'Resume deleted successfully' };
  },

  duplicateResume: (id: number): Resume => {
    const orig = localStore.getResumeById(id);
    return localStore.createResume({
      ...orig,
      title: `${orig.title} (Copy)`,
      content: JSON.parse(JSON.stringify(orig.content)),
    });
  },

  toggleShare: (id: number): { is_public: boolean; share_token: string } => {
    const resume = localStore.getResumeById(id);
    const newStatus = !resume.is_public;
    const shareToken = resume.share_token || `share-${Date.now()}`;
    localStore.updateResume(id, { is_public: newStatus, share_token: shareToken });
    return { is_public: newStatus, share_token: shareToken };
  },

  getSharedResume: (token: string): Resume => {
    const list = localStore.getResumes();
    const found = list.find((r) => r.share_token === token);
    if (found) return found;
    return list[0] || DEFAULT_RESUME;
  },

  getVersions: (id: number) => {
    const resume = localStore.getResumeById(id);
    return [
      {
        id: 1,
        resume_id: id,
        version_label: 'Current Working Version',
        content: resume.content,
        created_at: resume.updated_at,
      },
      {
        id: 2,
        resume_id: id,
        version_label: 'Initial Setup',
        content: DEFAULT_RESUME_CONTENT,
        created_at: resume.created_at,
      }
    ];
  },

  restoreVersion: (id: number, versionId: number): Resume => {
    const versions = localStore.getVersions(id);
    const v = versions.find((ver) => ver.id === versionId) || versions[0];
    return localStore.updateResume(id, { content: v.content });
  },

  // Deterministic ATS Engine
  analyzeATS: (resumeId: number): ATSResult => {
    const resume = localStore.getResumeById(resumeId);
    return localStore.analyzeATSRaw(resume.content, resume.target_role);
  },

  analyzeATSRaw: (content: ResumeContent, targetRole: string = ''): ATSResult => {
    const issues: ATSIssue[] = [];
    let score = 100;
    const sectionScores: Record<string, number> = {
      contact: 100,
      summary: 100,
      experience: 100,
      education: 100,
      skills: 100,
    };

    // 1. Contact Info Checks
    const p = content?.personal_info || ({} as any);
    if (!p.full_name?.trim()) {
      issues.push({
        id: 'contact-name',
        section: 'personal_info',
        severity: 'critical',
        title: 'Missing Full Name',
        description: 'Your resume must prominently include your legal full name at the top.',
        fix_action: 'Add your name in the Personal Info section',
      });
      score -= 20;
      sectionScores.contact -= 50;
    }

    if (!p.email?.trim() || !p.email.includes('@')) {
      issues.push({
        id: 'contact-email',
        section: 'personal_info',
        severity: 'critical',
        title: 'Missing or Invalid Email Address',
        description: 'Recruiters and ATS scanners require a valid email to contact you.',
        fix_action: 'Add your professional email address',
      });
      score -= 15;
      sectionScores.contact -= 30;
    }

    if (!p.phone?.trim()) {
      issues.push({
        id: 'contact-phone',
        section: 'personal_info',
        severity: 'warning',
        title: 'Missing Phone Number',
        description: 'Adding a phone number speeds up recruiter outreach for phone screens.',
        fix_action: 'Add your phone number with country/area code',
      });
      score -= 5;
      sectionScores.contact -= 10;
    }

    if (!p.linkedin?.trim()) {
      issues.push({
        id: 'contact-linkedin',
        section: 'personal_info',
        severity: 'suggestion',
        title: 'Missing LinkedIn Profile',
        description: '87% of technical recruiters review LinkedIn profiles during resume screening.',
        fix_action: 'Add your LinkedIn public profile URL',
      });
      score -= 3;
      sectionScores.contact -= 10;
    }

    // 2. Summary Checks
    const summary = content?.summary || '';
    if (!summary.trim()) {
      issues.push({
        id: 'summary-empty',
        section: 'summary',
        severity: 'warning',
        title: 'No Professional Summary',
        description: 'A concise 2-4 sentence summary helps ATS parsers identify your core domain.',
        fix_action: 'Add a high-impact professional summary highlighting years of experience',
      });
      score -= 10;
      sectionScores.summary -= 40;
    } else if (summary.trim().split(/\s+/).length < 25) {
      issues.push({
        id: 'summary-short',
        section: 'summary',
        severity: 'suggestion',
        title: 'Summary is Relatively Brief',
        description: 'Expand your summary with 2-3 key technical proficiencies and career achievements.',
        fix_action: 'Expand summary to 35-60 words',
      });
      score -= 4;
      sectionScores.summary -= 15;
    }

    // 3. Experience Checks
    const experience = content?.experience || [];
    if (experience.length === 0) {
      issues.push({
        id: 'exp-empty',
        section: 'experience',
        severity: 'critical',
        title: 'No Work Experience Added',
        description: 'Relevant work or internship history is the most weighted section for ATS scoring.',
        fix_action: 'Add at least one professional work experience or internship entry',
      });
      score -= 25;
      sectionScores.experience = 20;
    } else {
      let bulletsWithMetrics = 0;
      let totalBullets = 0;
      experience.forEach((exp) => {
        const bullets = exp.bullets || [];
        totalBullets += bullets.length;
        bullets.forEach((b) => {
          if (/\d+|%|\$|k\b/i.test(b)) {
            bulletsWithMetrics++;
          }
        });
      });

      if (totalBullets === 0) {
        issues.push({
          id: 'exp-no-bullets',
          section: 'experience',
          severity: 'critical',
          title: 'Experience Entries Lack Bullet Points',
          description: 'ATS parsers look for action-driven achievement bullet points under each role.',
          fix_action: 'Add 3-5 achievement bullet points to your experience entries',
        });
        score -= 15;
        sectionScores.experience -= 30;
      } else if (bulletsWithMetrics === 0) {
        issues.push({
          id: 'exp-no-metrics',
          section: 'experience',
          severity: 'warning',
          title: 'Bullet Points Lack Measurable Impact (Numbers/Metrics)',
          description: 'Resumes with quantified achievements (e.g., "reduced latency by 35%") receive 40% more interview requests.',
          fix_action: 'Incorporate percentages, metrics, or dollar values into your bullet points',
        });
        score -= 8;
        sectionScores.experience -= 20;
      }
    }

    // 4. Skills Checks
    const skillCats = content?.skills || [];
    const allSkills = skillCats.flatMap((c) => c.skills || []);
    if (allSkills.length < 5) {
      issues.push({
        id: 'skills-few',
        section: 'skills',
        severity: 'warning',
        title: 'Fewer than 5 Skills Listed',
        description: 'Include at least 6-12 relevant technical tools, languages, and frameworks for keyword matching.',
        fix_action: 'Add more core technical skills and tools',
      });
      score -= 10;
      sectionScores.skills -= 30;
    }

    // 5. Education Checks
    const education = content?.education || [];
    if (education.length === 0) {
      issues.push({
        id: 'edu-empty',
        section: 'education',
        severity: 'suggestion',
        title: 'No Education Entry Listed',
        description: 'Listing your degree, coursework, or university program helps fulfill standard recruiter filters.',
        fix_action: 'Add your university degree or highest education credential',
      });
      score -= 5;
      sectionScores.education -= 25;
    }

    // Passed checks indicator
    if (issues.length === 0) {
      issues.push({
        id: 'all-passed',
        section: 'overall',
        severity: 'passed',
        title: 'All Standard ATS Verification Checks Passed',
        description: 'Your resume follows standard ATS layout guidelines, has complete contact information, and presents quantified experience.',
      });
    }

    const finalScore = Math.max(20, Math.min(100, score));

    return {
      score: finalScore,
      total_checks: 12,
      passed_checks: 12 - issues.filter((i) => i.severity !== 'passed').length,
      critical_count: issues.filter((i) => i.severity === 'critical').length,
      warning_count: issues.filter((i) => i.severity === 'warning').length,
      suggestion_count: issues.filter((i) => i.severity === 'suggestion').length,
      issues,
      section_scores: sectionScores,
      summary_feedback:
        finalScore >= 85
          ? 'Excellent ATS readiness! Your resume matches industry best practices for parseability and keyword structure.'
          : finalScore >= 70
          ? 'Good ATS readiness with minor optimization opportunities. Addressing the flagged warnings will boost recruiter reach.'
          : 'ATS readiness requires attention. Please resolve the critical flags to ensure parsers can index your qualifications.',
    };
  },

  // Deterministic Job Match Engine
  analyzeJobMatch: (data: { resume_id: number; job_title: string; company?: string; job_description: string }): JobMatchResult => {
    const resume = localStore.getResumeById(data.resume_id);
    const content = resume.content;
    const allSkills = (content?.skills || []).flatMap((c) => c.skills || []).map((s) => s.toLowerCase());
    const allBullets = (content?.experience || []).flatMap((e) => e.bullets || []).join(' ').toLowerCase();
    const summary = (content?.summary || '').toLowerCase();
    const fullText = `${allSkills.join(' ')} ${allBullets} ${summary}`;

    const commonTechKeywords = [
      'react', 'typescript', 'javascript', 'python', 'fastapi', 'node.js', 'sql', 'postgresql',
      'docker', 'kubernetes', 'aws', 'cloud', 'ci/cd', 'rest', 'graphql', 'redis', 'agile',
      'git', 'testing', 'microservices', 'distributed systems', 'linux', 'html', 'css', 'tailwind'
    ];

    const jdText = data.job_description.toLowerCase();
    const jdKeywords = commonTechKeywords.filter((k) => jdText.includes(k));
    
    // Also extract capitalized words or common terms from JD
    const targetKeywords = jdKeywords.length > 0 ? jdKeywords : ['typescript', 'react', 'python', 'docker', 'ci/cd', 'sql'];

    const matching = targetKeywords.filter((k) => fullText.includes(k));
    const missing = targetKeywords.filter((k) => !fullText.includes(k));

    const matchRatio = targetKeywords.length > 0 ? matching.length / targetKeywords.length : 0.85;
    const matchScore = Math.min(98, Math.max(45, Math.round(matchRatio * 100)));

    const result: JobMatchResult = {
      id: Date.now(),
      match_score: matchScore,
      matching_skills: matching.map((k) => k.charAt(0).toUpperCase() + k.slice(1)),
      missing_skills: missing.map((k) => k.charAt(0).toUpperCase() + k.slice(1)),
      unmentioned_qualifications: missing.slice(0, 3).map((m) => `Demonstrated hands-on experience with ${m.toUpperCase()}`),
      relevant_projects: (content?.projects || []).map((p) => p.name).slice(0, 2),
      tailoring_suggestions: [
        missing.length > 0
          ? `Integrate explicit mentions of ${missing.slice(0, 3).join(', ')} into your Skills or Experience bullet points.`
          : 'Emphasize your leadership in project delivery and system performance.',
        `Align your resume headline with the target position: "${data.job_title}".`,
        'Highlight quantifiable business results in your most recent employment entries.',
      ],
      summary_assessment: `Your resume demonstrates an estimated ${matchScore}% alignment with the ${data.job_title} role at ${data.company || 'the target employer'}. Focusing on the identified keywords will optimize ATS pass rates.`,
    };

    // Save to match history
    const history = localStore.getJobMatchHistory();
    history.unshift({
      id: Date.now(),
      resume_id: data.resume_id,
      job_title: data.job_title,
      company: data.company || 'Confidential Employer',
      match_score: matchScore,
      matching_count: matching.length,
      missing_count: missing.length,
      created_at: new Date().toISOString(),
    });
    localStore.saveJobMatchHistory(history.slice(0, 20));

    return result;
  },

  deleteJobMatchItem: (id: number) => {
    let history = localStore.getJobMatchHistory();
    history = history.filter((item) => item.id !== id);
    localStore.saveJobMatchHistory(history);
    return { message: 'History item removed' };
  },

  // Cover Letters CRUD
  getCoverLetters: (): CoverLetter[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COVER_LETTERS);
      if (stored) return JSON.parse(stored);
    } catch {}
    const initial: CoverLetter[] = [
      {
        id: 1,
        user_id: 1,
        title: 'Cover Letter - Stripe',
        company_name: 'Stripe',
        job_title: 'Senior Full-Stack Engineer',
        recipient_name: 'Hiring Team',
        recipient_title: 'Engineering Director',
        tone: 'professional',
        length: 'standard',
        content: `Dear Hiring Team at Stripe,\n\nI am writing to express my enthusiastic interest in the Senior Full-Stack Engineer position at Stripe. With a strong track record in architecting high-throughput distributed systems and building responsive React applications, I am eager to contribute to Stripe's mission of expanding the GDP of the internet.\n\nThroughout my career at TechVanguard Solutions, I engineered scalable microservices handling over 120,000 daily active users while reducing latency by 34%. My background in TypeScript, Python, and PostgreSQL aligns directly with Stripe's technical standard for resilience, automated testing, and developer velocity.\n\nThank you for your consideration. I welcome the opportunity to discuss how my engineering experience can deliver value to your team.\n\nSincerely,\nAlex Morgan\nalex.morgan@resumate.ai | +1 (555) 019-2834`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.COVER_LETTERS, JSON.stringify(initial));
    return initial;
  },

  saveCoverLetters: (letters: CoverLetter[]) => {
    localStorage.setItem(STORAGE_KEYS.COVER_LETTERS, JSON.stringify(letters));
  },

  getCoverLetterById: (id: number): CoverLetter => {
    const list = localStore.getCoverLetters();
    const found = list.find((c) => c.id === id);
    if (found) return found;
    return list[0];
  },

  createCoverLetter: (data: Partial<CoverLetter>): CoverLetter => {
    const list = localStore.getCoverLetters();
    const newId = list.length > 0 ? Math.max(...list.map((c) => c.id)) + 1 : 1;
    const newLetter: CoverLetter = {
      id: newId,
      user_id: 1,
      title: data.title || `Cover Letter - ${data.company_name || 'New Application'}`,
      company_name: data.company_name || 'Target Company',
      job_title: data.job_title || 'Software Engineer',
      recipient_name: data.recipient_name || 'Hiring Manager',
      recipient_title: data.recipient_title || 'Recruiting Team',
      job_description: data.job_description || '',
      tone: data.tone || 'professional',
      length: data.length || 'standard',
      content:
        data.content ||
        `Dear Hiring Manager at ${data.company_name || 'your company'},\n\nI am writing to express my strong interest in the ${data.job_title || 'open role'}. With proven experience in modern web technologies and software engineering, I am excited about the opportunity to contribute to your team.\n\nSincerely,\nAlex Morgan`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.unshift(newLetter);
    localStore.saveCoverLetters(list);
    return newLetter;
  },

  updateCoverLetter: (id: number, data: Partial<CoverLetter>): CoverLetter => {
    const list = localStore.getCoverLetters();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) {
      return localStore.createCoverLetter(data);
    }
    const current = list[idx];
    const updated: CoverLetter = {
      ...current,
      ...data,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    localStore.saveCoverLetters(list);
    return updated;
  },

  deleteCoverLetter: (id: number) => {
    let list = localStore.getCoverLetters();
    list = list.filter((c) => c.id !== id);
    localStore.saveCoverLetters(list);
    return { message: 'Cover letter deleted successfully' };
  },

  duplicateCoverLetter: (id: number): CoverLetter => {
    const orig = localStore.getCoverLetterById(id);
    return localStore.createCoverLetter({
      ...orig,
      title: `${orig.title} (Copy)`,
    });
  },

  // Job Applications Tracker CRUD
  getApplications: (): JobApplication[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (stored) return JSON.parse(stored);
    } catch {}
    const initial: JobApplication[] = [
      {
        id: 1,
        user_id: 1,
        company: 'Stripe',
        job_title: 'Staff Full-Stack Engineer',
        location: 'San Francisco, CA (Hybrid)',
        salary_range: '$180k - $220k',
        status: 'interviewing',
        applied_date: new Date().toISOString().split('T')[0],
        notes: 'Passed screening call with recruiter; technical system design interview scheduled for next week.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        user_id: 1,
        company: 'Figma',
        job_title: 'Senior Frontend Systems Engineer',
        location: 'Remote',
        salary_range: '$175k - $210k',
        status: 'applied',
        applied_date: new Date().toISOString().split('T')[0],
        notes: 'Applied with tailored resume highlighting real-time canvas and WebSockets experience.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(initial));
    return initial;
  },

  saveApplications: (apps: JobApplication[]) => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  },

  createJobApplication: (data: Partial<JobApplication>): JobApplication => {
    const list = localStore.getApplications();
    const newId = list.length > 0 ? Math.max(...list.map((a) => a.id)) + 1 : 1;
    const newApp: JobApplication = {
      id: newId,
      user_id: 1,
      company: data.company || 'Target Company',
      job_title: data.job_title || 'Software Engineer',
      location: data.location || 'Remote',
      salary_range: data.salary_range || '',
      status: data.status || 'applied',
      applied_date: data.applied_date || new Date().toISOString().split('T')[0],
      job_url: data.job_url || '',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.unshift(newApp);
    localStore.saveApplications(list);
    return newApp;
  },

  updateJobApplication: (id: number, data: Partial<JobApplication>): JobApplication => {
    const list = localStore.getApplications();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) {
      return localStore.createJobApplication(data);
    }
    const current = list[idx];
    const updated: JobApplication = {
      ...current,
      ...data,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    localStore.saveApplications(list);
    return updated;
  },

  deleteJobApplication: (id: number) => {
    let list = localStore.getApplications();
    list = list.filter((a) => a.id !== id);
    localStore.saveApplications(list);
    return { message: 'Application deleted successfully' };
  },

  getJobMatchHistory: (): any[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.JOB_MATCH_HISTORY);
      if (stored) return JSON.parse(stored);
    } catch {}
    const initial = [
      {
        id: 1,
        resume_id: 1,
        job_title: 'Full Stack Engineer',
        company: 'NextGen Cloud Solutions',
        match_score: 91,
        matching_count: 8,
        missing_count: 2,
        created_at: new Date().toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.JOB_MATCH_HISTORY, JSON.stringify(initial));
    return initial;
  },

  saveJobMatchHistory: (history: any[]) => {
    localStorage.setItem(STORAGE_KEYS.JOB_MATCH_HISTORY, JSON.stringify(history));
  },

  // Deterministic AI Assistant Helpers
  improveSummary: (data: { current_summary: string; target_role?: string; experience_level?: string; tone?: string }): AISuggestion => {
    const role = data.target_role || 'Senior Software Engineer';
    const improved = `Results-focused ${role} with proven expertise in engineering high-throughput distributed applications, reducing system latencies by 35%, and driving agile technical teams. Adept in translating complex business requirements into resilient, test-driven architectures.`;
    return {
      original: data.current_summary,
      improved,
      explanation: 'Refined to lead with powerful action verbs, highlight quantifiable technical impact, and align with modern ATS scoring parameters.',
      changes: [
        'Added role-specific target keyword title',
        'Incorporated concrete metric (35% latency reduction)',
        'Strengthened executive tone and eliminated passive phrasing',
      ],
    };
  },

  enhanceBullets: (data: { bullet_points: string[]; job_role?: string; company?: string }): AISuggestion[] => {
    return (data.bullet_points || []).map((bullet, idx) => {
      let improved = bullet;
      if (!/\d+|%/.test(bullet)) {
        improved = `${bullet.replace(/\.$/, '')}, improving deployment velocity by 28% and eliminating 15+ weekly manual interventions.`;
      } else {
        improved = `Spearheaded architecture: ${bullet.replace(/^[a-z]/, (c) => c.toUpperCase())}`;
      }
      return {
        original: bullet,
        improved,
        explanation: 'Enriched with active power verbs (Spearheaded, Optimized) and quantified business impact.',
        changes: ['Added high-impact action verb', 'Included measurable operational metric', 'Polished punctuation'],
      };
    });
  },

  suggestSkills: (data: { target_role: string; current_skills: string[] }): string[] => {
    const roleLower = (data.target_role || '').toLowerCase();
    const curLower = new Set((data.current_skills || []).map((s) => s.toLowerCase()));
    
    let pool = ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'System Design', 'Redis', 'PostgreSQL', 'GraphQL', 'AWS Lambda', 'Microservices', 'Jest/Vitest'];
    if (roleLower.includes('frontend') || roleLower.includes('react')) {
      pool = ['React 18', 'TypeScript', 'Tailwind CSS', 'Next.js', 'State Management (Redux/Zustand)', 'WebSockets', 'Vite', 'Core Web Vitals', 'Accessibility (a11y)'];
    } else if (roleLower.includes('python') || roleLower.includes('backend')) {
      pool = ['FastAPI', 'PostgreSQL', 'Docker', 'Celery', 'Redis', 'SQLAlchemy', 'Pydantic', 'Microservices Architecture', 'Prometheus/Grafana'];
    }

    return pool.filter((s) => !curLower.has(s.toLowerCase())).slice(0, 8);
  },

  grammarCheck: (data: { text: string; field_name?: string }): AISuggestion => {
    const text = data.text || '';
    const cleaned = text
      .replace(/\s+/g, ' ')
      .replace(/ ,/g, ',')
      .replace(/ \./g, '.')
      .replace(/\bi\b/g, 'I')
      .trim();
    
    return {
      original: text,
      improved: cleaned.length > 0 ? cleaned : 'Professional, well-structured content with correct grammar and tone.',
      explanation: 'Cleaned redundant spacing, standardized capitalization, and ensured polished punctuation.',
      changes: ['Standardized punctuation spacing', 'Capitalized pronouns', 'Preserved technical acronyms'],
    };
  },

  generateLinkedInSummary: (data: { target_role: string; full_name: string; skills: string[] }): { headline: string; about: string } => {
    const headline = `${data.target_role || 'Senior Full-Stack Engineer'} | Building Scalable Web Platforms | ${data.skills.slice(0, 3).join(' • ')}`;
    const about = `Hi, I'm ${data.full_name || 'Alex'}.\n\nI specialize in building scalable, user-centric web applications and robust cloud backend services. Passionate about developer ergonomics, automated testing, and delivering high-impact business products.\n\nKey proficiencies: ${data.skills.join(', ')}.\n\nAlways open to discussing high-scale system design, open-source initiatives, and exciting engineering challenges.`;
    return { headline, about };
  },

  generateInterviewQuestions: (data: { resume_id?: number; target_role: string; company_name: string }) => {
    const role = data.target_role || 'Software Engineer';
    const company = data.company_name || 'Tech Company';
    return {
      role,
      company,
      questions: [
        {
          category: 'System Design & Architecture',
          question: `How would you architect a high-throughput, low-latency API service at ${company} handling 50k+ requests/sec?`,
          tip: 'Walk through database indexing, caching strategies with Redis, horizontal scaling, and fault tolerance mechanisms.',
        },
        {
          category: 'Behavioral & Leadership',
          question: 'Describe a challenging production outage you investigated and how you prevented it from recurring.',
          tip: 'Use the STAR format (Situation, Task, Action, Result). Highlight blameless post-mortem analysis and monitoring safeguards.',
        },
        {
          category: 'Technical Problem Solving',
          question: `Given your experience with ${role}, what metrics do you prioritize when optimizing frontend or backend performance?`,
          tip: 'Discuss Core Web Vitals (LCP, FID), API p99 response times, and database query profiling.',
        },
      ],
    };
  },

  getInternshipChecklist: () => {
    return [
      {
        phase: '1. Resume & Profile Readiness',
        items: [
          { id: 'item-1', label: 'ATS-optimized 1-page resume with quantified projects', recommended: true },
          { id: 'item-2', label: 'GitHub portfolio with clean READMEs, live demo links, and tests', recommended: true },
          { id: 'item-3', label: 'Updated LinkedIn profile with custom headline and portfolio banner', recommended: true },
        ],
      },
      {
        phase: '2. Application & Networking',
        items: [
          { id: 'item-4', label: 'Target 15-20 companies aligning with your technical interests', recommended: true },
          { id: 'item-5', label: 'Reach out to 5 engineering alumni or recruiters for informational chats', recommended: false },
          { id: 'item-6', label: 'Track all application deadlines and interview stages in Job Tracker', recommended: true },
        ],
      },
      {
        phase: '3. Technical Interview Prep',
        items: [
          { id: 'item-7', label: 'Review core Data Structures & Algorithms (Trees, Graphs, Hash Maps)', recommended: true },
          { id: 'item-8', label: 'Conduct 2 mock technical interviews with peers or mentors', recommended: true },
        ],
      },
    ];
  },

  listTemplates: (): TemplateInfo[] => {
    return TEMPLATES_DATA;
  },

  exportJson: (id: number) => {
    const resume = localStore.getResumeById(id);
    return resume;
  },

  importJson: (payload: any): Resume => {
    return localStore.createResume({
      title: payload.title || 'Imported Resume',
      template_id: payload.template_id || 'ats_classic',
      content: payload.content || DEFAULT_RESUME_CONTENT,
    });
  },
};

