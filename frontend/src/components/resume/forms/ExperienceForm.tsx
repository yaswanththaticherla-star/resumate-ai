import React, { useState } from 'react';
import { ExperienceItem } from '../../../types';
import { Plus, Trash2, ChevronUp, ChevronDown, Sparkles, Building2, MapPin, Calendar } from 'lucide-react';
import { api } from '../../../services/api';

interface Props {
  items: ExperienceItem[];
  onChange: (updated: ExperienceItem[]) => void;
}

export const ExperienceForm: React.FC<Props> = ({ items, onChange }) => {
  const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null);

  const handleAddItem = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: '',
      role: '',
      location: '',
      start_date: '',
      end_date: '',
      current: false,
      bullets: [''],
      technologies: [],
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateField = (index: number, field: keyof ExperienceItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    onChange(updated);
  };

  const handleBulletChange = (itemIdx: number, bulletIdx: number, value: string) => {
    const updated = [...items];
    const bullets = [...updated[itemIdx].bullets];
    bullets[bulletIdx] = value;
    updated[itemIdx].bullets = bullets;
    onChange(updated);
  };

  const handleAddBullet = (itemIdx: number) => {
    const updated = [...items];
    updated[itemIdx].bullets = [...updated[itemIdx].bullets, ''];
    onChange(updated);
  };

  const handleRemoveBullet = (itemIdx: number, bulletIdx: number) => {
    const updated = [...items];
    updated[itemIdx].bullets = updated[itemIdx].bullets.filter((_, i) => i !== bulletIdx);
    onChange(updated);
  };

  const handleEnhanceBullets = async (index: number) => {
    const job = items[index];
    if (!job.bullets || job.bullets.length === 0) return;
    setEnhancingIndex(index);
    try {
      const enhanced = await api.enhanceBullets({
        bullet_points: job.bullets.filter((b) => b.trim().length > 0),
        job_role: job.role,
        company: job.company,
      });
      const updated = [...items];
      updated[index].bullets = enhanced.map((res) => res.improved);
      onChange(updated);
    } catch (err) {
      alert('Bullet enhancement failed: ' + err);
    } finally {
      setEnhancingIndex(null);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Work Experience
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            List your employment history in reverse-chronological order.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Position</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-xs text-slate-500 mb-3">No work experience added yet.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + Add your first role
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((job, idx) => (
            <div
              key={job.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3.5"
            >
              {/* Card Controls */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  #{idx + 1} {job.role || 'New Position'} {job.company ? `— ${job.company}` : ''}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-rose-500 hover:text-rose-700 ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Position Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title / Role *
                  </label>
                  <input
                    type="text"
                    value={job.role}
                    onChange={(e) => handleUpdateField(idx, 'role', e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={job.company}
                      onChange={(e) => handleUpdateField(idx, 'company', e.target.value)}
                      placeholder="e.g. Stripe"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={job.location}
                    onChange={(e) => handleUpdateField(idx, 'location', e.target.value)}
                    placeholder="San Francisco, CA (or Remote)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={job.start_date}
                      onChange={(e) => handleUpdateField(idx, 'start_date', e.target.value)}
                      placeholder="2022-01"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="text"
                      disabled={job.current}
                      value={job.current ? 'Present' : job.end_date}
                      onChange={(e) => handleUpdateField(idx, 'end_date', e.target.value)}
                      placeholder="2024-05"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Current Job Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`current-${job.id}`}
                  checked={job.current}
                  onChange={(e) => handleUpdateField(idx, 'current', e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <label htmlFor={`current-${job.id}`} className="text-xs text-slate-600 dark:text-slate-400">
                  I currently work here
                </label>
              </div>

              {/* Bullet Points */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Bullet Points & Achievements
                  </label>
                  <button
                    type="button"
                    disabled={enhancingIndex === idx}
                    onClick={() => handleEnhanceBullets(idx)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{enhancingIndex === idx ? 'Enhancing...' : 'AI Enhance All Bullets'}</span>
                  </button>
                </div>

                {job.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2">
                    <span className="text-slate-400 mt-2 text-xs">•</span>
                    <textarea
                      rows={2}
                      value={bullet}
                      onChange={(e) => handleBulletChange(idx, bIdx, e.target.value)}
                      placeholder="Accomplished [X] as measured by [Y] by doing [Z]..."
                      className="flex-1 p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(idx, bIdx)}
                      className="p-1 text-slate-400 hover:text-rose-500 mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleAddBullet(idx)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline block pt-1"
                >
                  + Add another bullet point
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

