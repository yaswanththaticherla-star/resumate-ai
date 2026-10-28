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
import { AppLayout } from './components/layout/AppLayout';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Root immediately navigates to Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/share/:token" element={<PublicResumePage />} />

      {/* Obsolete auth routes redirect immediately to Dashboard */}
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/register" element={<Navigate to="/dashboard" replace />} />

      {/* Main Workspace Application inside AppLayout (no authentication guards) */}
      <Route element={<AppLayout />}>
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

      {/* Catch-all redirect to Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
