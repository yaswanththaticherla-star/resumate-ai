import React, { useState } from 'react';
import { SkillCategory } from '../../../types';
import { Plus, Trash2, X, Sparkles, Tag } from 'lucide-react';
import { api } from '../../../services/api';

interface Props {
  categories: SkillCategory[];
  targetRole?: string;
  onChange: (updated: SkillCategory[]) => void;
}

export const SkillsForm: React.FC<Props> = ({ categories, targetRole, onChange }) => {
  const [newSkillInput, setNewSkillInput] = useState<{ [catId: string]: string }>({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);

  const handleAddCategory = () => {
    const newCat: SkillCategory = {
      id: `skill-${Date.now()}`,
      name: 'Technical Skills',
      skills: [],
    };
    onChange([...categories, newCat]);
  };

  const handleRemoveCategory = (catId: string) => {
    onChange(categories.filter((c) => c.id !== catId));
  };

  const handleCategoryNameChange = (catId: string, name: string) => {
    onChange(
      categories.map((c) => (c.id === catId ? { ...c, name } : c))
    );
  };

  const handleAddSkill = (catId: string) => {
    const text = (newSkillInput[catId] || '').trim();
    if (!text) return;
    onChange(
      categories.map((c) => {
        if (c.id === catId) {
          if (!c.skills.includes(text)) {
            return { ...c, skills: [...c.skills, text] };
          }
        }
        return c;
      })
    );
    setNewSkillInput({ ...newSkillInput, [catId]: '' });
  };

  const handleRemoveSkill = (catId: string, skill: string) => {
    onChange(
      categories.map((c) => {
        if (c.id === catId) {
          return { ...c, skills: c.skills.filter((s) => s !== skill) };
        }
        return c;
      })
    );
  };

  const handleGetAISuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const allCurrent: string[] = [];
      categories.forEach((c) => allCurrent.push(...c.skills));
      const suggestions = await api.suggestSkills({
        target_role: targetRole || 'Full-Stack Developer',
        current_skills: allCurrent,
      });
      setSuggestedSkills(suggestions);
    } catch (err) {
      alert('Failed to get skill suggestions: ' + err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAddSuggestedSkill = (skill: string) => {
    if (categories.length === 0) {
      handleAddCategory();
    }
    const targetCatId = categories[0]?.id || `skill-${Date.now()}`;
    onChange(
      categories.map((c, idx) => {
        if (idx === 0) {
          return { ...c, skills: [...c.skills, skill] };
        }
        return c;
      })
    );
    setSuggestedSkills(suggestedSkills.filter((s) => s !== skill));
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Skills & Competencies
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Group hard skills, tools, and technical competencies for ATS keyword matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loadingSuggestions}
            onClick={handleGetAISuggestions}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loadingSuggestions ? 'Finding...' : 'AI Suggest Skills'}</span>
          </button>
          <button
            type="button"
            onClick={handleAddCategory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* AI Suggestions Pill Bar */}
      {suggestedSkills.length > 0 && (
        <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30">
          <div className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Recommended Keywords for {targetRole || 'your role'}:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedSkills.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddSuggestedSkill(s)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
              >
                <span>+ {s}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={cat.name}
                onChange={(e) => handleCategoryNameChange(cat.id, e.target.value)}
                placeholder="Category Name (e.g. Languages & Frameworks)"
                className="font-bold text-xs text-slate-800 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5"
              />
              <button
                type="button"
                onClick={() => handleRemoveCategory(cat.id)}
                className="p-1 text-slate-400 hover:text-rose-500"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Skills Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              {cat.skills.length === 0 && (
                <span className="text-xs text-slate-400 italic">No skills in this category yet.</span>
              )}
              {cat.skills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <Tag className="w-2.5 h-2.5 text-slate-400" />
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(cat.id, skill)}
                    className="hover:text-rose-500 text-slate-400 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInput[cat.id] || ''}
                onChange={(e) => setNewSkillInput({ ...newSkillInput, [cat.id]: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(cat.id);
                  }
                }}
                placeholder="Type a skill and press Enter or click Add (e.g. Docker, TypeScript)"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(cat.id)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-white dark:bg-slate-700 text-xs font-semibold hover:bg-slate-900"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

