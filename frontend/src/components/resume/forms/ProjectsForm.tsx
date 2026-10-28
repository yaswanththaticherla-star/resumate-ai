import React from 'react';
import { ProjectItem } from '../../../types';
import { Plus, Trash2, ChevronUp, ChevronDown, FolderGit2, Globe, Github } from 'lucide-react';

interface Props {
  items: ProjectItem[];
  onChange: (updated: ProjectItem[]) => void;
}

export const ProjectsForm: React.FC<Props> = ({ items, onChange }) => {
  const handleAddItem = () => {
    const newItem: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: '',
      description: '',
      role: '',
      technologies: [],
      outcomes: '',
      repo_url: '',
      live_url: '',
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof ProjectItem, value: any) => {
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

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Technical & Personal Projects
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showcase real-world implementations, open-source repos, and demonstrable achievements.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-xs text-slate-500 mb-3">No projects added yet.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + Add your first project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((proj, idx) => (
            <div
              key={proj.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  #{idx + 1} {proj.name || 'Untitled Project'}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                    placeholder="e.g. Distributed Telemetry Platform"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Role
                  </label>
                  <input
                    type="text"
                    value={proj.role}
                    onChange={(e) => handleUpdate(idx, 'role', e.target.value)}
                    placeholder="e.g. Lead Architect, Full-Stack Developer"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Technologies Used (comma separated)
                </label>
                <input
                  type="text"
                  value={proj.technologies ? proj.technologies.join(', ') : ''}
                  onChange={(e) =>
                    handleUpdate(
                      idx,
                      'technologies',
                      e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  placeholder="React, TypeScript, FastAPI, PostgreSQL, Docker"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                  placeholder="Engineered a telemetry pipeline processing real-time system metrics with low latency..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Key Outcomes & Measurable Impact
                </label>
                <input
                  type="text"
                  value={proj.outcomes}
                  onChange={(e) => handleUpdate(idx, 'outcomes', e.target.value)}
                  placeholder="e.g. Scaled to 10k+ concurrent users; reduced memory consumption by 32%"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GitHub / Source Code URL
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="url"
                      value={proj.repo_url}
                      onChange={(e) => handleUpdate(idx, 'repo_url', e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Live Demo / Deployment URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="url"
                      value={proj.live_url}
                      onChange={(e) => handleUpdate(idx, 'live_url', e.target.value)}
                      placeholder="https://demo.app.io"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

