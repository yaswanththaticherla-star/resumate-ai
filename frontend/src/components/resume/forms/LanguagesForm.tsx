import React from 'react';
import { LanguageItem } from '../../../types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  items: LanguageItem[];
  onChange: (updated: LanguageItem[]) => void;
}

export const LanguagesForm: React.FC<Props> = ({ items, onChange }) => {
  const handleAdd = () => {
    const newItem: LanguageItem = {
      id: `lang-${Date.now()}`,
      language: '',
      proficiency: 'Fluent',
    };
    onChange([...items, newItem]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof LanguageItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Languages
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Languages spoken and proficiency levels.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Language</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-xs text-slate-500">No languages specified.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((l, idx) => (
            <div
              key={l.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3"
            >
              <input
                type="text"
                value={l.language}
                onChange={(e) => handleUpdate(idx, 'language', e.target.value)}
                placeholder="Language (e.g. English, Spanish, Mandarin)"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <select
                value={l.proficiency}
                onChange={(e) => handleUpdate(idx, 'proficiency', e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="Native">Native / Bilingual</option>
                <option value="Fluent">Fluent / Professional</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Basic">Basic / Elementary</option>
              </select>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 text-slate-400 hover:text-rose-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

