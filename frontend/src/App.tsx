import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyResumesPage } from './pages/MyResumesPage';
import { ResumeEditorPage } from './pages/ResumeEditorPage';
import { ResumePreviewExportPage } from './pages/ResumePreviewExportPage';
import { TemplateGalleryPage } from './pages/TemplateGalleryPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ATSCheckerPage } from './pages/ATSCheckerPage';
import { JobMatcherPage } from './pages/JobMatcherPage';
import { CoverLetterPage } from './pages/CoverLetterPage';
import { CareerToolsPage } from './pages/CareerToolsPage';
import { PricingPage } from './pages/PricingPage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicResumePage } from './pages/PublicResumePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AppLayout } from './components/layout/AppLayout';
import { useAuth } from './context/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading ResuMate AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          isLoading ? (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/share/:token" element={<PublicResumePage />} />

      {/* Authentication Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Application Workspace inside AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/my-resumes" element={<MyResumesPage />} />
        <Route path="/editor" element={<ResumeEditorPage />} />
        <Route path="/editor/:id" element={<ResumeEditorPage />} />
        <Route path="/preview" element={<ResumePreviewExportPage />} />
        <Route path="/preview/:id" element={<ResumePreviewExportPage />} />
        <Route path="/export" element={<ResumePreviewExportPage />} />
        <Route path="/export/:id" element={<ResumePreviewExportPage />} />
        <Route path="/templates" element={<TemplateGalleryPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/ats-checker" element={<ATSCheckerPage />} />
        <Route path="/job-matcher" element={<JobMatcherPage />} />
        <Route path="/cover-letters" element={<CoverLetterPage />} />
        <Route path="/job-tracker" element={<CareerToolsPage initialTab="tracker" />} />
        <Route path="/career-tools" element={<CareerToolsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<SettingsPage />} />
      </Route>

      {/* Catch-all redirect to Dashboard (which redirects to /login if unauthenticated) */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
