import React from 'react';
import { AchievementItem } from '../../../types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  items: AchievementItem[];
  onChange: (updated: AchievementItem[]) => void;
}

export const AchievementsForm: React.FC<Props> = ({ items, onChange }) => {
  const handleAdd = () => {
    const newItem: AchievementItem = {
      id: `ach-${Date.now()}`,
      title: '',
      description: '',
      date: '',
    };
    onChange([...items, newItem]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof AchievementItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Honors & Achievements
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Awards, hackathon wins, scholarships, publications, or competitive recognitions.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Award</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-xs text-slate-500">No achievements recorded.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((ach, idx) => (
            <div
              key={ach.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 relative"
            >
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Title / Award Name *
                  </label>
                  <input
                    type="text"
                    value={ach.title}
                    onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                    placeholder="e.g. 1st Place National Hackathon"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={ach.date}
                    onChange={(e) => handleUpdate(idx, 'date', e.target.value)}
                    placeholder="2023"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={ach.description}
                  onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                  placeholder="Recognized out of 100+ competitors for building an accessible AI reader..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

