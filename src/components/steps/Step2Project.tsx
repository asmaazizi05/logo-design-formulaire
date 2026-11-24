import React from 'react';
import { BriefFormData, BriefSchema, Language } from '../../types/brief';
import { UI_TEXT } from '../../data/translations';
import { CustomFieldsRenderer } from '../CustomFieldsRenderer';

interface Step2Props {
  schema: BriefSchema;
  data: BriefFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof BriefFormData>(field: K, value: BriefFormData[K]) => void;
  onCustomChange: (fieldId: string, value: string | string[]) => void;
  lang: Language;
  darkMode: boolean;
}

export const Step2Project: React.FC<Step2Props> = ({
  schema,
  data,
  errors,
  onChange,
  onCustomChange,
  lang,
  darkMode,
}) => {
  const t = UI_TEXT[lang];
  const customFields = schema.customFields.filter((f) => f.stepId === 'project');

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
        <label htmlFor="projectDescription" className={labelClass}>
          {t.projectDesc}
        </label>
        <textarea
          id="projectDescription"
          rows={4}
          value={data.projectDescription}
          onChange={(e) => onChange('projectDescription', e.target.value)}
          placeholder={t.projectDescPlaceholder}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-colors ${inputBase}`}
        />
      </div>

      <div className={cardClass}>
        <label htmlFor="targetAudience" className={labelClass}>
          {t.targetAudience}
        </label>
        <input
          id="targetAudience"
          type="text"
          value={data.targetAudience}
          onChange={(e) => onChange('targetAudience', e.target.value)}
          placeholder={t.targetAudiencePlaceholder}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${inputBase}`}
        />
      </div>

      <div className={cardClass}>
        <label htmlFor="exactTextToInclude" className={labelClass}>
          {t.exactText}
        </label>
        <p className={`text-xs mb-3 -mt-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {t.exactTextHelper}
        </p>
        <textarea
          id="exactTextToInclude"
          rows={4}
          value={data.exactTextToInclude}
          onChange={(e) => onChange('exactTextToInclude', e.target.value)}
          placeholder={t.exactTextPlaceholder}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-colors ${inputBase}`}
        />
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
