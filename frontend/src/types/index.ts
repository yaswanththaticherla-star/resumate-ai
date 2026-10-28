export interface User {
  id: number;
  email: string;
  full_name: string;
  headline?: string;
  avatar_url?: string;
  theme_preference: string;
  default_template: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PersonalInfo {
  full_name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  avatar_url: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string;
  current: boolean;
  bullets: string[];
  technologies: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  graduation_date: string;
  gpa: string;
  honors: string;
  coursework: string[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  role: string;
  technologies: string[];
  outcomes: string;
  repo_url: string;
  live_url: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiry_date: string;
  credential_id: string;
  credential_url: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  content: string;
}

export interface ResumeContent {
  personal_info: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  languages: LanguageItem[];
  custom_sections: CustomSectionItem[];
  section_order: string[];
  hidden_sections: string[];
}

export interface Resume {
  id: number;
  user_id: number;
  title: string;
  template_id: string;
  theme_color: string;
  font_family: string;
  font_size: string;
  spacing: string;
  is_public: boolean;
  share_token?: string;
  target_role?: string;
  ats_score: number;
  content: ResumeContent;
  created_at: string;
  updated_at: string;
}

export interface ResumeVersion {
  id: number;
  resume_id: number;
  version_label: string;
  content: ResumeContent;
  created_at: string;
}

export interface ATSIssue {
  id: string;
  section: string;
  severity: 'critical' | 'warning' | 'suggestion' | 'passed';
  title: string;
  description: string;
  fix_action?: string;
  fix_data?: Record<string, any>;
}

export interface ATSResult {
  score: number;
  total_checks: number;
  passed_checks: number;
  critical_count: number;
  warning_count: number;
  suggestion_count: number;
  issues: ATSIssue[];
  section_scores: Record<string, number>;
  summary_feedback: string;
}

export interface JobMatchResult {
  id?: number;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  unmentioned_qualifications: string[];
  relevant_projects: string[];
  tailoring_suggestions: string[];
  summary_assessment: string;
}

export interface CoverLetter {
  id: number;
  user_id: number;
  resume_id?: number;
  title: string;
  company_name: string;
  job_title: string;
  recipient_name?: string;
  recipient_title?: string;
  job_description?: string;
  tone: string;
  length: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: number;
  user_id: number;
  resume_id?: number;
  company: string;
  job_title: string;
  location?: string;
  salary_range?: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  applied_date?: string;
  job_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AISuggestion {
  original: string;
  improved: string;
  explanation: string;
  changes: string[];
}

export interface TemplateInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  recommended_for: string;
  layout: string;
  features: string[];
}

