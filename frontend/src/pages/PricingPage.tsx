import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { BackButton } from '../components/common/BackButton';

export const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors text-left">
      <Navbar />

      <div className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div>
          <BackButton to="/" label="Back to Home" />
        </div>
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Simple, Transparent Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            ResuMate AI offers full local access to all core features. No surprise subscriptions or paywalled resume downloads.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Free Standard Tier */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Community Tier
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                <span className="text-xs text-slate-500">/ forever free</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Everything required to create, test, and export your resume with ATS compatibility.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Unlimited Resumes & Versions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>All 6 ATS-Friendly Templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Transparent ATS Readiness Checker</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Job Description Matcher</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Unrestricted PDF & DOCX Word Downloads</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Built-in NLP Rule Engine</span>
                </li>
              </ul>
            </div>

            <Link
              to="/register"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-center text-xs font-semibold shadow-sm transition-all"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro / Cloud AI Tier */}
          <div className="bg-gradient-to-b from-indigo-900/10 to-indigo-900/5 dark:from-indigo-950/40 dark:to-slate-900 rounded-3xl border-2 border-indigo-500/50 p-8 shadow-xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute top-4 right-6">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-sm">
                Advanced AI
              </span>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Bring Your Own Key (BYOK)
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                <span className="text-xs text-slate-500">+ Optional Gemini / OpenAI API</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Plug in your own Gemini or OpenAI API key in the environment configuration for real-time generative capabilities.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Everything in Community Tier</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Live Gemini 1.5 Pro / Flash Inference</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Contextual Cover Letter Tailoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Custom Interview Simulation & Mock Q&A</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Privacy First: Keys never shared or logged</span>
                </li>
              </ul>
            </div>

            <Link
              to="/register"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-center text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Start Building Now
            </Link>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">
            Honest & Transparent Guarantee
          </p>
          <p>
            Unlike typical online builders that demand payment only after you spend an hour building a resume, ResuMate AI provides authentic, unwatermarked PDF and Word export freely without fabricated paywalls.
          </p>
        </div>
      </div>
    </div>
  );
};

