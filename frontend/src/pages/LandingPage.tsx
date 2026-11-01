import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  FileCheck, 
  FileText, 
  Zap, 
  Target, 
  Bot, 
  ChevronDown, 
  ChevronUp, 
  Star,
  Download,
  Users
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../context/useAuth';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCreateResumeCTA = () => {
    navigate('/dashboard');
  };

  const faqs = [
    {
      q: 'How does ResuMate AI optimize for Applicant Tracking Systems (ATS)?',
      a: 'ResuMate AI audits your resume against industry ATS algorithms (like Workday, Taleo, and Greenhouse). It validates clear single-column hierarchies, standard section headers, keyword density, and quantifiable accomplishment metrics.'
    },
    {
      q: 'Can I build and download my resume without an external AI API key?',
      a: 'Yes, absolutely! The full resume editor, 6 professional templates, ATS readiness analysis, and PDF/Word downloads work 100% out of the box with our built-in intelligent NLP rules engine.'
    },
    {
      q: 'Will ResuMate AI invent false experience or qualifications?',
      a: 'Never. Our AI guidelines strictly prohibit fabricating false job titles, employers, degrees, or certifications. Our assistant enhances your authentic contributions using strong action verbs and professional formatting.'
    },
    {
      q: 'Can I download both PDF and Word (.DOCX) formats?',
      a: 'Yes! You can export pixel-perfect, printer-ready A4 PDFs with selectable text, as well as native Microsoft Word (.DOCX) files compatible with recruiters and agency portals.'
    },
    {
      q: 'Is my personal career data private and secure?',
      a: 'Yes. Your resumes and documents are strictly stored in your private workspace database. We never share or sell your career data.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-blue-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Next-Generation Career & Resume Builder</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Build Your Dream Resume with <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">AI Intelligence</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Create recruiter-approved, ATS-optimized resumes in minutes. Enhance bullet points with power action verbs, match job descriptions, and pass screening algorithms with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCreateResumeCTA}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <span>Create My Resume</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/templates"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm sm:text-base shadow-sm transition-all"
              >
                <span>Explore Templates</span>
              </Link>
            </div>

            {/* Micro proof badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Free Local Testing
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 6 ATS-Tested Templates
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Fabrication AI
              </span>
            </div>
          </div>

          {/* Visual CSS-based Interactive Mockup Preview */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-6 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-slate-400 ml-2">resumate-live-editor.v1</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  ATS Score: 94% Excellent
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Mock Controls */}
              <div className="space-y-3 text-left">
                <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Suggestion
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    "Replaced passive voice with <strong>Architected</strong>, increasing keyword match by 28%."
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Template: ATS Classic
                  </div>
                  <div className="flex gap-2">
                    <span className="h-4 w-4 rounded-full bg-indigo-600" />
                    <span className="h-4 w-4 rounded-full bg-slate-900" />
                    <span className="h-4 w-4 rounded-full bg-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Right Mock Resume Preview */}
              <div className="md:col-span-2 bg-white text-slate-900 p-5 rounded-xl border border-slate-200 shadow-sm text-left font-sans text-xs space-y-2.5">
                <div className="border-b-2 border-indigo-600 pb-2">
                  <h3 className="text-base font-bold text-slate-900">ALEX MORGAN</h3>
                  <p className="text-indigo-600 text-[11px] font-semibold">Lead Full-Stack Engineer • San Francisco, CA</p>
                  <p className="text-[10px] text-slate-500">alex.morgan@resumate.ai | github.com/alex | linkedin.com/in/alex</p>
                </div>
                <div>
                  <h4 className="font-bold text-[10px] uppercase text-indigo-900 border-b border-slate-200 pb-0.5">Summary</h4>
                  <p className="text-[10.5px] text-slate-700 pt-0.5">
                    Innovative Full-Stack Engineer with 5+ years of experience architecting high-throughput distributed APIs and real-time React web applications.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-[10px] uppercase text-indigo-900 border-b border-slate-200 pb-0.5">Experience</h4>
                  <div className="pt-0.5">
                    <div className="flex justify-between font-bold text-[11px]">
                      <span>Senior Engineer | TechVanguard</span>
                      <span className="font-normal text-slate-500">2022 - Present</span>
                    </div>
                    <ul className="list-disc ml-3 text-[10px] text-slate-700 space-y-0.5 mt-0.5">
                      <li>Architected FastAPI microservices processing 120k+ daily events with 99.98% uptime.</li>
                      <li>Streamlined automated CI/CD pipeline, reducing deployment turnaround from 45 to 8 mins.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Core Capabilities
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Everything You Need to Land Interviews
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A complete career suite designed to navigate modern hiring software seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-left space-y-3 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ATS Readiness Scanner
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Receive an objective 0-100% readiness score with real checks for section headers, bullet metrics, action verbs, and layout formatting.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-left space-y-3 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Job Description Matcher
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Paste any job posting to analyze matched keywords, discover missing competencies, and receive targeted tailoring suggestions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-left space-y-3 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Download className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Accurate PDF & DOCX Export
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Export pixel-perfect A4 documents with selectable text, clickable hyperlinks, and native Microsoft Word (.DOCX) formatting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Simple 3-Step Process
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              How ResuMate AI Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="text-2xl font-extrabold text-indigo-600">01</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Input Career History</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Fill in your education, technical skills, projects, and employment history with live real-time preview.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="text-2xl font-extrabold text-indigo-600">02</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Analyze with ATS Engine</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Run our transparent ATS scanner to detect weak verbs, missing contact information, and keyword density gaps.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="text-2xl font-extrabold text-indigo-600">03</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Download & Land Interviews</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Switch between 6 recruiter-approved templates, generate a tailored cover letter, and export clean PDFs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Questions & Answers
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-3 text-left">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="h-4 w-4 text-indigo-600" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">ResuMate AI</span>
            <span>— Smart Resume & Career Builder</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/templates" className="hover:text-indigo-600">Templates</Link>
            <Link to="/pricing" className="hover:text-indigo-600">Pricing</Link>
            <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          </div>
          <div>© {new Date().getFullYear()} ResuMate AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

