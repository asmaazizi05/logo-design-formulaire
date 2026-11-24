import React from 'react';
import { BriefFormData, BriefSchema, Language } from '../../types/brief';
import { DEFAULT_BRIEF_SCHEMA } from '../../data/defaultSchema';
import { getLocalizedOptionLabel, getLocalizedStep, UI_TEXT } from '../../data/translations';
import { CustomFieldsRenderer } from '../CustomFieldsRenderer';

interface Step4Props {
  schema: BriefSchema;
  data: BriefFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof BriefFormData>(field: K, value: BriefFormData[K]) => void;
  onCustomChange: (fieldId: string, value: string | string[]) => void;
  lang: Language;
  darkMode: boolean;
}

export const Step4Print: React.FC<Step4Props> = ({
  schema,
  data,
  errors,
  onChange,
  onCustomChange,
  lang,
  darkMode,
}) => {
  const t = UI_TEXT[lang];
  const rawPrintStep = schema.steps.find((s) => s.id === 'print');
  const stepNote =
    (rawPrintStep && getLocalizedStep(rawPrintStep, lang).note) ||
    (lang === 'en'
      ? 'Fill in this section if your project includes physical media or printing.'
      : 'Remplissez cette section si votre projet inclut un support physique ou une impression.');

  const activeSupports = schema.printSupports.filter((o) => o.enabled);
  const activePrinters = schema.printerSituations.filter((o) => o.enabled);
  const activeFinishes = schema.printFinishes.filter((o) => o.enabled);
  const customFields = schema.customFields.filter((f) => f.stepId === 'print');

  const isDigitalOnly = data.printSupports.includes('none-digital');

  const toggleSupport = (id: string) => {
    const exists = data.printSupports.includes(id);
    if (id === 'none-digital') {
      onChange('printSupports', exists ? [] : ['none-digital']);
      return;
    }
    const withoutNone = data.printSupports.filter((s) => s !== 'none-digital');
    const next = exists ? withoutNone.filter((s) => s !== id) : [...withoutNone, id];
    onChange('printSupports', next);
  };

  const toggleFinish = (id: string) => {
    const exists = data.printFinishes.includes(id);
    const next = exists
      ? data.printFinishes.filter((f) => f !== id)
      : [...data.printFinishes, id];
    onChange('printFinishes', next);
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
      <div
        className={`rounded-xl border-l-4 border-l-teal-700 border px-4 py-3 text-sm ${
          darkMode
            ? 'form-card-glass-dark text-zinc-200'
            : 'form-card-glass text-zinc-700'
        }`}
      >
        {stepNote}
      </div>

      <div className={cardClass}>
        <h3 className={labelClass}>{t.printSupports}</h3>
        <div className="space-y-2">
          {activeSupports.map((opt) => {
            const selected = data.printSupports.includes(opt.id);
            const label = getLocalizedOptionLabel(opt, DEFAULT_BRIEF_SCHEMA.printSupports, lang);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleSupport(opt.id)}
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
                  className={`h-4 w-4 shrink-0 rounded border transition-colors ${
                    selected
                      ? 'border-teal-700 bg-teal-700 shadow-[inset_0_0_0_2.5px_#ffffff]'
                      : darkMode
                      ? 'border-zinc-600 bg-zinc-800'
                      : 'border-zinc-400 bg-white'
                  }`}
                />
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`space-y-4 transition-opacity ${isDigitalOnly ? 'opacity-50' : 'opacity-100'}`}>
        <div className={cardClass}>
          <label htmlFor="printDimensions" className={labelClass}>
            {t.dimensions}
          </label>
          <input
            id="printDimensions"
            type="text"
            value={data.printDimensions}
            onChange={(e) => onChange('printDimensions', e.target.value)}
            placeholder={t.dimensionsPlaceholder}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${inputBase}`}
          />
        </div>

        <div className={cardClass}>
          <h3 className={labelClass}>{t.printerSituation}</h3>
          <div className="space-y-2">
            {activePrinters.map((opt) => {
              const selected = data.printerSituation === opt.id;
              const label = getLocalizedOptionLabel(
                opt,
                DEFAULT_BRIEF_SCHEMA.printerSituations,
                lang
              );
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange('printerSituation', opt.id)}
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

        <div className={cardClass}>
          <h3 className={labelClass}>{t.finishes}</h3>
          <div className="space-y-2">
            {activeFinishes.map((opt) => {
              const selected = data.printFinishes.includes(opt.id);
              const label = getLocalizedOptionLabel(opt, DEFAULT_BRIEF_SCHEMA.printFinishes, lang);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleFinish(opt.id)}
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
                    className={`h-4 w-4 shrink-0 rounded border transition-colors ${
                      selected
                        ? 'border-teal-700 bg-teal-700 shadow-[inset_0_0_0_2.5px_#ffffff]'
                        : darkMode
                        ? 'border-zinc-600 bg-zinc-800'
                        : 'border-zinc-400 bg-white'
                    }`}
                  />
                  <span className="font-medium">{label}</span>
                </button>
              );
            })}
          </div>
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
