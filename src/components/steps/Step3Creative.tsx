import React from 'react';
import { BriefFormData, BriefSchema, Language } from '../../types/brief';
import { DEFAULT_BRIEF_SCHEMA } from '../../data/defaultSchema';
import { getLocalizedOptionLabel, getLocalizedStyle, UI_TEXT } from '../../data/translations';
import { CustomFieldsRenderer } from '../CustomFieldsRenderer';

interface Step3Props {
  schema: BriefSchema;
  data: BriefFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof BriefFormData>(field: K, value: BriefFormData[K]) => void;
  onCustomChange: (fieldId: string, value: string | string[]) => void;
  lang: Language;
  darkMode: boolean;
}

export const Step3Creative: React.FC<Step3Props> = ({
  schema,
  data,
  errors,
  onChange,
  onCustomChange,
  lang,
  darkMode,
}) => {
  const t = UI_TEXT[lang];
  const activeStyles = schema.styles.filter((s) => s.enabled);
  const activeLogoOpts = schema.existingLogoOptions.filter((o) => o.enabled);
  const customFields = schema.customFields.filter((f) => f.stepId === 'creative');

  const toggleStyle = (id: string) => {
    const exists = data.selectedStyles.includes(id);
    const next = exists
      ? data.selectedStyles.filter((s) => s !== id)
      : [...data.selectedStyles, id];
    onChange('selectedStyles', next);
  };

  const cardClass = `rounded-xl border p-5 sm:p-6 ${
    darkMode ? 'form-card-glass-dark' : 'form-card-glass'
  }`;

  const inputBase = darkMode
    ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-teal-500'
    : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-teal-700';

  const labelClass = `block text-[15px] font-semibold mb-3 ${
    darkMode ? 'text-zinc-100' : 'text-zinc-900'
  }`;

  return (
    <div className="space-y-4">
      <div className={cardClass}>
        <h3 className={labelClass}>
          {t.visualStyle}{' '}
          <span className="text-xs font-normal text-zinc-400">{t.multiChoice}</span>
        </h3>
        <div className="space-y-2">
          {activeStyles.map((rawStyle) => {
            const style = getLocalizedStyle(rawStyle, lang);
            const isSelected = data.selectedStyles.includes(style.id);
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => toggleStyle(style.id)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                  isSelected
                    ? darkMode
                      ? 'border-teal-600 bg-teal-950/35 text-zinc-100'
                      : 'border-teal-700 bg-teal-50/60 text-zinc-900'
                    : darkMode
                    ? 'border-zinc-800 bg-zinc-900/50 text-zinc-200 hover:border-zinc-700'
                    : 'border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50'
                }`}
              >
                <span
                  className={`h-4 w-4 shrink-0 rounded border transition-colors ${
                    isSelected
                      ? 'border-teal-700 bg-teal-700 shadow-[inset_0_0_0_2.5px_#ffffff]'
                      : darkMode
                      ? 'border-zinc-600 bg-zinc-800'
                      : 'border-zinc-400 bg-white'
                  }`}
                />
                <span className="font-medium">{style.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={cardClass}>
        <label htmlFor="colorPreferences" className={labelClass}>
          {t.colorPref}
        </label>
        <input
          id="colorPreferences"
          type="text"
          value={data.colorPreferences}
          onChange={(e) => onChange('colorPreferences', e.target.value)}
          placeholder={t.colorPrefPlaceholder}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${inputBase}`}
        />
      </div>

      <div className={cardClass}>
        <h3 className={labelClass}>{t.existingLogo}</h3>
        <div className="space-y-2">
          {activeLogoOpts.map((opt) => {
            const selected = data.hasExistingLogo === opt.id;
            const label = getLocalizedOptionLabel(
              opt,
              DEFAULT_BRIEF_SCHEMA.existingLogoOptions,
              lang
            );
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange('hasExistingLogo', opt.id)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                  selected
                    ? darkMode
                      ? 'border-teal-600 bg-teal-950/35 text-zinc-100'
                      : 'border-teal-700 bg-teal-50/60 text-zinc-900'
                    : darkMode
                    ? 'border-zinc-800 bg-zinc-900/50 text-zinc-200 hover:border-zinc-700'
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
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <CustomFieldsRenderer
        fields={customFields}
        answers={data.customAnswers}
        errors={errors}
        onChange={onCustomChange}
        lang={lang}
        darkMode={darkMode}
      />
    </div>
  );
};
