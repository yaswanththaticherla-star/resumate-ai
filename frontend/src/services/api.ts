import { 
  Resume, 
  ResumeContent, 
  ATSResult, 
  JobMatchResult, 
  CoverLetter, 
  JobApplication, 
  User, 
  TemplateInfo,
  AISuggestion
} from '../types';

const API_BASE = '/api';

export function getStoredToken(): string | null {
  return null;
}

export function setStoredToken(_token: string | null) {
  try {
    localStorage.removeItem('resumate_token');
  } catch {}
}

function getAuthHeaders(): HeadersInit {
  return {};
}

export class ApiError extends Error {
  status: number;
  detail?: any;

  constructor(status: number, message: string, detail?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

const DEFAULT_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
};

let backendReachable = true;

export function isBackendOnline(): boolean {
  return backendReachable;
}

async function request<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...DEFAULT_HEADERS,
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    // 2xx Success
    if (response.ok) {
      backendReachable = true;
      return await response.json();
    }

    // Parse server error detail
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    let detailData: any = null;
    try {
      const errData = await response.json();
      detailData = errData;
      if (errData.detail) {
        if (typeof errData.detail === 'string') {
          errorMsg = errData.detail;
        } else if (Array.isArray(errData.detail)) {
          errorMsg = errData.detail
            .map((item: any) => item.msg || item.message || JSON.stringify(item))
            .join(', ');
        } else {
          errorMsg = JSON.stringify(errData.detail);
        }
      } else if (errData.message) {
        errorMsg = errData.message;
      }
    } catch {}

    throw new ApiError(response.status, errorMsg, detailData);
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    backendReachable = false;
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out: The backend did not respond within 10 seconds. Please check if your FastAPI server is running.');
    }
    if (err.message === 'Failed to fetch' || err.message?.includes('NetworkError') || err.message?.includes('network')) {
      throw new Error('Cannot connect to ResuMate AI backend (127.0.0.1:8000). Please ensure your FastAPI server is running.');
    }
    throw new Error(err.message || 'Network error: Failed to connect to ResuMate AI backend server.');
  }
}

export const api = {
  // Workspace User Profile
  getMe: () =>
    request<User>('/auth/me'),

  getProfile: () =>
    request<User>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    request<User>(
      '/auth/profile',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    ),

  // Backwards compatibility stubs
  register: async (_data: any) => ({ access_token: '', token_type: 'bearer', user: {} as User }),
  login: async (_data: any) => ({ access_token: '', token_type: 'bearer', user: {} as User }),

  // Resumes
  listResumes: () =>
    request<Resume[]>('/resumes'),

  getResume: (id: number) =>
    request<Resume>(`/resumes/${id}`),

  createResume: (data: Partial<Resume>) =>
    request<Resume>(
      '/resumes',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  updateResume: (id: number, data: Partial<Resume>) =>
    request<Resume>(
      `/resumes/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    ),

  deleteResume: (id: number) =>
    request<{ message: string }>(
      `/resumes/${id}`,
      {
        method: 'DELETE',
      }
    ),

  duplicateResume: (id: number) =>
    request<Resume>(
      `/resumes/${id}/duplicate`,
      {
        method: 'POST',
      }
    ),

  toggleShare: (id: number) =>
    request<{ is_public: boolean; share_token: string }>(
      `/resumes/${id}/share`,
      {
        method: 'POST',
      }
    ),

  getSharedResume: (token: string) =>
    request<Resume>(`/resumes/shared/${token}`),

  getVersions: (id: number) =>
    request<{ id: number; resume_id: number; version_label: string; content: ResumeContent; created_at: string }[]>(
      `/resumes/${id}/versions`
    ),

  restoreVersion: (id: number, versionId: number) =>
    request<Resume>(
      `/resumes/${id}/restore/${versionId}`,
      {
        method: 'POST',
      }
    ),

  // ATS Checker
  analyzeATS: (resumeId: number) =>
    request<ATSResult>(`/ats/analyze/${resumeId}`),

  analyzeATSRaw: (content: ResumeContent, targetRole: string = '') =>
    request<ATSResult>(
      '/ats/analyze-raw',
      {
        method: 'POST',
        body: JSON.stringify({ content, target_role: targetRole }),
      }
    ),

  // Job Matcher
  analyzeJobMatch: (data: { resume_id: number; job_title: string; company?: string; job_description: string }) =>
    request<JobMatchResult>(
      '/job-match/analyze',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  getJobMatchHistory: () =>
    request<any[]>('/job-match/history'),

  deleteJobMatchItem: (id: number) =>
    request<{ message: string }>(
      `/job-match/history/${id}`,
      {
        method: 'DELETE',
      }
    ),

  // Cover Letters
  listCoverLetters: () =>
    request<CoverLetter[]>('/cover-letters'),

  getCoverLetter: (id: number) =>
    request<CoverLetter>(`/cover-letters/${id}`),

  createCoverLetter: (data: Partial<CoverLetter>) =>
    request<CoverLetter>(
      '/cover-letters',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  updateCoverLetter: (id: number, data: Partial<CoverLetter>) =>
    request<CoverLetter>(
      `/cover-letters/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    ),

  deleteCoverLetter: (id: number) =>
    request<{ message: string }>(
      `/cover-letters/${id}`,
      {
        method: 'DELETE',
      }
    ),

  duplicateCoverLetter: (id: number) =>
    request<CoverLetter>(
      `/cover-letters/${id}/duplicate`,
      {
        method: 'POST',
      }
    ),

  // AI Assistant
  getAIStatus: () =>
    request<{ status: string; provider: string; is_cloud_active: boolean; message: string }>(
      '/ai/status'
    ),

  improveSummary: (data: { current_summary: string; target_role?: string; experience_level?: string; tone?: string }) =>
    request<AISuggestion>(
      '/ai/improve-summary',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  enhanceBullets: (data: { bullet_points: string[]; job_role?: string; company?: string }) =>
    request<AISuggestion[]>(
      '/ai/enhance-bullets',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  suggestSkills: (data: { target_role: string; current_skills: string[] }) =>
    request<string[]>(
      '/ai/suggest-skills',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  grammarCheck: (data: { text: string; field_name?: string }) =>
    request<AISuggestion>(
      '/ai/grammar-check',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  generateLinkedInSummary: (data: { target_role: string; full_name: string; skills: string[] }) =>
    request<{ headline: string; about: string }>(
      '/ai/linkedin-summary',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  chatWithAI: (data: { message: string; history?: { role: string; content: string }[]; target_role?: string; resume_context?: string }) =>
    request<{ response: string; provider: string; model: string; fallback_used: boolean }>(
      '/ai/chat',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  // Career Tools
  listJobApplications: () =>
    request<JobApplication[]>('/career/applications'),

  createJobApplication: (data: Partial<JobApplication>) =>
    request<JobApplication>(
      '/career/applications',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  updateJobApplication: (id: number, data: Partial<JobApplication>) =>
    request<JobApplication>(
      `/career/applications/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    ),

  deleteJobApplication: (id: number) =>
    request<{ message: string }>(
      `/career/applications/${id}`,
      {
        method: 'DELETE',
      }
    ),

  generateInterviewQuestions: (data: { resume_id?: number; target_role: string; company_name: string }) =>
    request<{ role: string; company: string; questions: { category: string; question: string; tip: string }[] }>(
      '/career/interview-questions',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  getInternshipChecklist: () =>
    request<{ phase: string; items: { id: string; label: string; recommended: boolean }[] }[]>(
      '/career/internship-checklist'
    ),

  // Templates
  listTemplates: () =>
    request<TemplateInfo[]>('/templates'),

  // Exports
  exportDocxUrl: (id: number) => `${API_BASE}/export/docx/${id}`,
  exportJson: (id: number) =>
    request<any>(`/export/json/${id}`),
  importJson: (payload: any) =>
    request<Resume>(
      '/export/import-json',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
  exportAccountData: () =>
    request<any>('/export/account-data'),
};
