import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
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
import { AppLayout } from './components/layout/AppLayout';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-xs text-slate-400">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/share/:token" element={<PublicResumePage />} />

      {/* Protected App Pages inside AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/my-resumes" element={<DashboardPage />} />
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
