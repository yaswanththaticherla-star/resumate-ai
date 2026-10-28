import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showPercent?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 'md',
  label = 'ATS Score',
  showPercent = true,
}) => {
  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Gauge colors
  let strokeColor = '#10B981'; // green
  let textColor = 'text-emerald-600 dark:text-emerald-400';
  let badgeBg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300';

  if (boundedScore < 50) {
    strokeColor = '#EF4444'; // red
    textColor = 'text-rose-600 dark:text-rose-400';
    badgeBg = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300';
  } else if (boundedScore < 70) {
    strokeColor = '#F59E0B'; // amber
    textColor = 'text-amber-600 dark:text-amber-400';
    badgeBg = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
  } else if (boundedScore < 85) {
    strokeColor = '#6366F1'; // indigo
    textColor = 'text-indigo-600 dark:text-indigo-400';
    badgeBg = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300';
  }

  const dimensions = {
    sm: { width: 72, stroke: 6, text: 'text-lg', label: 'text-xs' },
    md: { width: 120, stroke: 10, text: 'text-3xl', label: 'text-xs' },
    lg: { width: 160, stroke: 12, text: 'text-4xl', label: 'text-sm' },
  }[size];

  const radius = (dimensions.width - dimensions.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (boundedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimensions.width}
          height={dimensions.width}
          className="transform -rotate-90 transition-all duration-700 ease-out"
        >
          {/* Background circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={dimensions.stroke}
            className="text-slate-100 dark:text-slate-800"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`font-bold ${dimensions.text} ${textColor}`}>
            {boundedScore}
            {showPercent && <span className="text-xs font-normal opacity-75">%</span>}
          </span>
        </div>
      </div>
      {label && (
        <span className={`mt-2 font-medium ${dimensions.label} px-2.5 py-0.5 rounded-full ${badgeBg}`}>
          {label}
        </span>
      )}
    </div>
  );
};

