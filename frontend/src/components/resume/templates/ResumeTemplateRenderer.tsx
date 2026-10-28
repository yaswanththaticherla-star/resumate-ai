import React from 'react';
import { ResumeContent } from '../../../types';
import { ATSClassicTemplate } from './ATSClassicTemplate';
import { ModernProfessionalTemplate } from './ModernProfessionalTemplate';
import { SoftwareDeveloperTemplate } from './SoftwareDeveloperTemplate';
import { StudentFresherTemplate } from './StudentFresherTemplate';
import { MinimalistTemplate } from './MinimalistTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';

interface ResumeTemplateRendererProps {
  templateId: string;
  content: ResumeContent;
  themeColor?: string;
  fontFamily?: string;
  fontSize?: string;
  spacing?: string;
}

export const ResumeTemplateRenderer: React.FC<ResumeTemplateRendererProps> = ({
  templateId,
  content,
  themeColor = '#4F46E5',
  fontFamily = 'Inter',
  fontSize = 'medium',
  spacing = 'normal',
}) => {
  switch (templateId) {
    case 'modern_pro':
      return (
        <ModernProfessionalTemplate
          content={content}
          themeColor={themeColor}
          fontFamily={fontFamily}
          fontSize={fontSize}
          spacing={spacing}
        />
      );
    case 'software_dev':
      return (
        <SoftwareDeveloperTemplate
          content={content}
          themeColor={themeColor}
          fontFamily={fontFamily}
          fontSize={fontSize}
          spacing={spacing}
        />
      );
    case 'student_fresher':
      return (
        <StudentFresherTemplate
          content={content}
          themeColor={themeColor}
          fontFamily={fontFamily}
          fontSize={fontSize}
          spacing={spacing}
        />
      );
    case 'minimalist':
      return (
        <MinimalistTemplate
          content={content}
          themeColor={themeColor}
          fontFamily={fontFamily}
          fontSize={fontSize}
          spacing={spacing}
        />
      );
    case 'executive':
      return (
        <ExecutiveTemplate
          content={content}
          themeColor={themeColor}
          fontFamily={fontFamily}
          fontSize={fontSize}
          spacing={spacing}
        />
      );
    case 'ats_classic':
    default:
      return (
        <ATSClassicTemplate
          content={content}
          themeColor={themeColor}
          fontFamily={fontFamily}
          fontSize={fontSize}
          spacing={spacing}
        />
      );
  }
};

