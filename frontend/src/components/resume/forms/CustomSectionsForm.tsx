import React from 'react';
import { CustomSectionItem } from '../../../types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  items: CustomSectionItem[];
  onChange: (updated: CustomSectionItem[]) => void;
}

export const CustomSectionsForm: React.FC<Props> = ({ items = [], onChange }) => {
  const handleAdd = () => {
    const newItem: CustomSectionItem = {
      id: `custom-${Date.now()}`,
      title: 'Additional Section',
      content: '',
    };
    onChange([...items, newItem]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof CustomSectionItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Custom Sections
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add custom categories such as Publications, Speaking Engagements, Volunteer Work, or Patents.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Section</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No custom sections created yet. Click "Add Custom Section" to include additional categories.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((sec, idx) => (
            <div
              key={sec.id || idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 relative shadow-sm"
            >
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 p-1 transition-colors"
                title="Remove Section"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Section Title *
                </label>
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                  placeholder="e.g. Publications & Speaking Engagements"
                  className="w-full sm:w-2/3 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Content / Details *
                </label>
                <textarea
                  rows={4}
                  value={sec.content}
                  onChange={(e) => handleUpdate(idx, 'content', e.target.value)}
                  placeholder="Describe your achievements, speaking highlights, publications, or volunteer experience..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

