import React from 'react';
import { CertificationItem } from '../../../types';
import { Plus, Trash2, Award } from 'lucide-react';

interface Props {
  items: CertificationItem[];
  onChange: (updated: CertificationItem[]) => void;
}

export const CertificationsForm: React.FC<Props> = ({ items, onChange }) => {
  const handleAdd = () => {
    const newItem: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
      expiry_date: '',
      credential_id: '',
      credential_url: '',
    };
    onChange([...items, newItem]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof CertificationItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Certifications & Licenses
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Professional industry certifications (AWS, Google Cloud, Cisco, etc.).
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Certificate</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-xs text-slate-500">No certifications listed yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((cert, idx) => (
            <div
              key={cert.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-3 relative"
            >
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Certification Name *
                </label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                  placeholder="AWS Solutions Architect"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issuing Organization *
                </label>
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => handleUpdate(idx, 'issuer', e.target.value)}
                  placeholder="Amazon Web Services"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Date
                </label>
                <input
                  type="text"
                  value={cert.date}
                  onChange={(e) => handleUpdate(idx, 'date', e.target.value)}
                  placeholder="2023-08"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Credential ID or URL
                </label>
                <input
                  type="text"
                  value={cert.credential_url || cert.credential_id}
                  onChange={(e) => handleUpdate(idx, 'credential_url', e.target.value)}
                  placeholder="https://..."
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

