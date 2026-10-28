import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  label = 'Back', 
  className = '',
  iconOnly = false
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] cursor-pointer ${className}`}
      title="Return to previous screen"
    >
      <ArrowLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
};

