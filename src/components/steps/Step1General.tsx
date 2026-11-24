import React, { useMemo } from 'react';
import { BriefFormData, BriefSchema, Language, ServiceOption } from '../../types/brief';
import {
  getLocalizedService,
  getLocalizedServiceCategory,
  UI_TEXT,
} from '../../data/translations';
import { CustomFieldsRenderer } from '../CustomFieldsRenderer';

interface Step1Props {
  schema: BriefSchema;
  data: BriefFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof BriefFormData>(field: K, value: BriefFormData[K]) => void;
  onCustomChange: (fieldId: string, value: string | string[]) => void;
  lang: Language;
  darkMode: boolean;
  isClientLockedView: boolean;
  onOpenNeedsEditor: () => void;
}

export const Step1General: React.FC<Step1Props> = ({
  schema,
  data,
  errors,
  onChange,
  onCustomChange,
  lang,
  darkMode,
  isClientLockedView,
  onOpenNeedsEditor,
}) => {
  const t = UI_TEXT[lang];
  const activeServices = schema.services.filter((s) => s.enabled);
  const customFields = schema.customFields.filter((f) => f.stepId === 'general');

  // Group services cleanly by category preserving original order
  const groupedServices = useMemo(() => {
    const groups: { category: string; items: ServiceOption[] }[] = [];
    const indexMap = new Map<string, number>();

    for (const raw of activeServices) {
      const srv = getLocalizedService(raw, lang);
      const rawTag = raw.tag?.trim() || (lang === 'en' ? 'OTHER SERVICES' : 'AUTRES SERVICES');
      const displayCategory = getLocalizedServiceCategory(rawTag, lang);

      if (!indexMap.has(rawTag)) {
        indexMap.set(rawTag, groups.length);
        groups.push({ category: displayCategory, items: [srv] });
      } else {
        groups[indexMap.get(rawTag)!].items.push(srv);
      }
    }
    return groups;
  }, [activeServices, lang]);

  const toggleService = (id: string) => {
    const exists = data.selectedServices.includes(id);
    const next = exists
      ? data.selectedServices.filter((s) => s !== id)
      : [...data.selectedServices, id];
    onChange('selectedServices', next);
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
        <label htmlFor="fullName" className={labelClass}>
          {t.fullName} <span className="text-rose-500">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          value={data.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          placeholder={t.yourAnswer}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${inputBase} ${
            errors.fullName ? 'border-rose-500' : ''
          }`}
        />
        {errors.fullName && (
          <p className="mt-2 text-xs font-medium text-rose-500">{errors.fullName}</p>
        )}
      </div>

      <div className={cardClass}>
        <label htmlFor="brandName" className={labelClass}>
          {t.brandName} <span className="text-rose-500">*</span>
        </label>
        <input
          id="brandName"
          type="text"
          value={data.brandName}
          onChange={(e) => onChange('brandName', e.target.value)}
          placeholder={t.yourAnswer}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${inputBase} ${
            errors.brandName ? 'border-rose-500' : ''
          }`}
        />
        {errors.brandName && (
          <p className="mt-2 text-xs font-medium text-rose-500">{errors.brandName}</p>
        )}
      </div>

      <div className={cardClass}>
        <label htmlFor="whatsapp" className={labelClass}>
          {t.whatsapp} <span className="text-rose-500">*</span>
        </label>
        <input
          id="whatsapp"
          type="tel"
          value={data.whatsapp}
          onChange={(e) => onChange('whatsapp', e.target.value)}
          placeholder={t.whatsappPlaceholder}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${inputBase} ${
            errors.whatsapp ? 'border-rose-500' : ''
          }`}
        />
        {errors.whatsapp && (
          <p className="mt-2 text-xs font-medium text-rose-500">{errors.whatsapp}</p>
        )}
      </div>

      <div className={cardClass}>
        <label htmlFor="email" className={labelClass}>
          {t.email} <span className="text-xs font-normal text-zinc-400">{t.optional}</span>
        </label>
        <input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder={t.emailPlaceholder}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${inputBase} ${
            errors.email ? 'border-rose-500' : ''
          }`}
        />
        {errors.email && (
          <p className="mt-2 text-xs font-medium text-rose-500">{errors.email}</p>
        )}
      </div>

      {/* Categorized Services Card */}
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-200/70 dark:border-zinc-800">
          <h3
            className={`text-[15px] font-semibold ${
              darkMode ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            {t.servicesWanted}{' '}
            <span className="text-xs font-normal text-zinc-400">{t.multiChoice}</span>
          </h3>

          {!isClientLockedView && (
            <button
              type="button"
              onClick={onOpenNeedsEditor}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                darkMode
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              {t.modifyNeeds}
            </button>
          )}
        </div>

        <div className="space-y-5">
          {groupedServices.map((group) => (
            <div key={group.category} className="space-y-2">
              <h4
                className={`text-xs font-bold tracking-wide uppercase ${
                  darkMode ? 'text-teal-400' : 'text-teal-800'
                }`}
              >
                {group.category}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((service) => {
                  const isSelected = data.selectedServices.includes(service.id);

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer ${
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
                        className={`mt-0.5 h-4 w-4 shrink-0 rounded border transition-colors ${
                          isSelected
                            ? 'border-teal-700 bg-teal-700 shadow-[inset_0_0_0_2.5px_#ffffff]'
                            : darkMode
                            ? 'border-zinc-600 bg-zinc-800'
                            : 'border-zinc-400 bg-white'
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium leading-snug">{service.title}</div>
                        {service.subtitle && (
                          <div
                            className={`mt-0.5 text-[11px] ${
                              darkMode ? 'text-zinc-400' : 'text-zinc-500'
                            }`}
                          >
                            {service.subtitle}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <label htmlFor="customNeedNote" className={labelClass}>
          {t.otherNeed} <span className="text-xs font-normal text-zinc-400">{t.optional}</span>
        </label>
        <input
          id="customNeedNote"
          type="text"
          value={data.customNeedNote}
          onChange={(e) => onChange('customNeedNote', e.target.value)}
          placeholder={t.otherNeedPlaceholder}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${inputBase}`}
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
