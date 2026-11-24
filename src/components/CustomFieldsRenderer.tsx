import React from 'react';
import { CustomField, Language } from '../types/brief';
import { UI_TEXT } from '../data/translations';

interface CustomFieldsRendererProps {
  fields: CustomField[];
  answers: Record<string, string | string[]>;
  errors: Record<string, string>;
  onChange: (fieldId: string, value: string | string[]) => void;
  lang: Language;
  darkMode: boolean;
}

export const CustomFieldsRenderer: React.FC<CustomFieldsRendererProps> = ({
  fields,
  answers,
  errors,
  onChange,
  lang,
  darkMode,
}) => {
  const t = UI_TEXT[lang];
  const activeFields = fields.filter((f) => f.enabled);
  if (activeFields.length === 0) return null;

  const cardClass = `rounded-xl border p-5 sm:p-6 ${
    darkMode ? 'form-card-glass-dark' : 'form-card-glass'
  }`;

  const inputBase = darkMode
    ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-teal-500'
    : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-teal-700';

  return (
    <>
      {activeFields.map((field) => {
        const val = answers[field.id];
        const err = errors[`custom_${field.id}`];

        return (
          <div key={field.id} className={cardClass}>
            <label
              className={`block text-[15px] font-semibold mb-3 ${
                darkMode ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              {field.label}
              {field.required && <span className="text-rose-500 ml-1">*</span>}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                value={typeof val === 'string' ? val : ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                placeholder={field.placeholder || t.yourAnswer}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${inputBase} ${
                  err ? 'border-rose-500' : ''
                }`}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                rows={3}
                value={typeof val === 'string' ? val : ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                placeholder={field.placeholder || t.yourAnswer}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${inputBase} ${
                  err ? 'border-rose-500' : ''
                }`}
              />
            )}

            {field.type === 'select' && (
              <div className="space-y-2">
                {(field.options || []).map((opt) => {
                  const selected = val === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onChange(field.id, opt)}
                      className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                        selected
                          ? darkMode
                            ? 'border-teal-600 bg-teal-950/35 text-zinc-100'
                            : 'border-teal-700 bg-teal-50/60 text-zinc-900'
                          : darkMode
                          ? 'border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700'
                          : 'border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? 'border-teal-700 bg-teal-700'
                            : darkMode
                            ? 'border-zinc-600'
                            : 'border-zinc-400'
                        }`}
                      >
                        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {field.type === 'checkbox-group' && (
              <div className="space-y-2">
                {(field.options || []).map((opt) => {
                  const arr = Array.isArray(val) ? val : [];
                  const selected = arr.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        const next = selected ? arr.filter((x) => x !== opt) : [...arr, opt];
                        onChange(field.id, next);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                        selected
                          ? darkMode
                            ? 'border-teal-600 bg-teal-950/35 text-zinc-100'
                            : 'border-teal-700 bg-teal-50/60 text-zinc-900'
                          : darkMode
                          ? 'border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700'
                          : 'border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50'
                      }`}
                    >
                      <span
                        className={`h-4 w-4 shrink-0 rounded border transition-colors ${
                          selected
                            ? 'border-teal-700 bg-teal-700 shadow-[inset_0_0_0_2.5px_#ffffff]'
                            : darkMode
                            ? 'border-zinc-600 bg-zinc-800'
                            : 'border-zinc-400 bg-white'
                        }`}
                      />
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {err && <p className="mt-2 text-xs font-medium text-rose-500">{err}</p>}
          </div>
        );
      })}
    </>
  );
};
