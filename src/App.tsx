import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BriefFormData,
  BriefSchema,
  Language,
  SavedPreset,
  StepId,
} from './types/brief';
import {
  createInitialFormData,
  DEFAULT_BRIEF_SCHEMA,
} from './data/defaultSchema';
import { getLocalizedStep, UI_TEXT } from './data/translations';
import { decodeShareLinkFromLocation } from './utils/shareLink';
import { generateBriefPdf } from './utils/pdfGenerator';
import { HeaderHero } from './components/HeaderHero';
import { FormPageMeta, ProgressBar } from './components/ProgressBar';
import { Step1General } from './components/steps/Step1General';
import { Step2Project } from './components/steps/Step2Project';
import { Step3Creative } from './components/steps/Step3Creative';
import { Step4Print } from './components/steps/Step4Print';
import { Step5Inspiration } from './components/steps/Step5Inspiration';
import { ConfirmationView } from './components/ConfirmationView';
import { AgencyEditor } from './components/AgencyEditor';
import { ShareModal } from './components/ShareModal';
import { StudioFooter } from './components/StudioFooter';

const STORAGE_SCHEMA_KEY = 'logo_design_brief_schema_v3';
const STORAGE_PRESETS_KEY = 'logo_design_brief_presets_v1';
const STORAGE_THEME_KEY = 'logo_design_brief_theme_v1';
const STORAGE_LANG_KEY = 'logo_design_brief_lang_v1';

function loadStoredSchema(): BriefSchema {
  try {
    const raw = localStorage.getItem(STORAGE_SCHEMA_KEY);
    if (!raw) return DEFAULT_BRIEF_SCHEMA;
    const parsed = JSON.parse(raw) as BriefSchema;
    if (!parsed.agency || !Array.isArray(parsed.services) || !Array.isArray(parsed.steps)) {
      return DEFAULT_BRIEF_SCHEMA;
    }
    return parsed;
  } catch {
    return DEFAULT_BRIEF_SCHEMA;
  }
}

function loadStoredPresets(): SavedPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedPreset[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function App() {
  const sharedOnLoad = useMemo(() => decodeShareLinkFromLocation(), []);

  const [lang, setLang] = useState<Language>(() => {
    if (sharedOnLoad?.lang === 'en' || sharedOnLoad?.lang === 'fr') {
      return sharedOnLoad.lang;
    }
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      return saved === 'en' ? 'en' : 'fr';
    } catch {
      return 'fr';
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  const [schema, setSchema] = useState<BriefSchema>(() =>
    sharedOnLoad ? sharedOnLoad.schema : loadStoredSchema()
  );

  const [formData, setFormData] = useState<BriefFormData>(() => {
    const base = createInitialFormData(sharedOnLoad ? sharedOnLoad.schema : loadStoredSchema());
    if (sharedOnLoad?.prefill) {
      return {
        ...base,
        ...sharedOnLoad.prefill,
      };
    }
    return base;
  });

  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>(() => loadStoredPresets());
  const [isClientLockedView, setIsClientLockedView] = useState<boolean>(
    Boolean(sharedOnLoad?.clientMode)
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [maxReachedIdx, setMaxReachedIdx] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const cardTopRef = useRef<HTMLDivElement | null>(null);
  const t = UI_TEXT[lang];

  const enabledSectionIds = useMemo<StepId[]>(() => {
    const enabled = schema.steps.filter((s) => s.enabled).map((s) => s.id);
    return enabled.length > 0 ? enabled : ['general'];
  }, [schema.steps]);

  const formPages = useMemo<FormPageMeta[]>(() => {
    const hasPage2Sections = enabledSectionIds.some((id) =>
      ['creative', 'print', 'inspiration'].includes(id)
    );
    const pages: FormPageMeta[] = [
      {
        id: 'page1',
        shortTitle: t.page1Short,
        title: t.page1Title,
      },
    ];
    if (hasPage2Sections) {
      pages.push({
        id: 'page2',
        shortTitle: t.page2Short,
        title: t.page2Title,
      });
    }
    return pages;
  }, [enabledSectionIds, t.page1Short, t.page1Title, t.page2Short, t.page2Title]);

  const safePageIdx = Math.min(currentPageIdx, formPages.length - 1);
  const currentPage = formPages[safePageIdx];

  useEffect(() => {
    if (window.location.pathname === '/') {
      window.history.replaceState(
        null,
        '',
        `/logo-design-formulaire${window.location.search}${window.location.hash}`
      );
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const nextShared = decodeShareLinkFromLocation();
      if (!nextShared) return;
      setSchema(nextShared.schema);
      setFormData({
        ...createInitialFormData(nextShared.schema),
        ...(nextShared.prefill || {}),
      });
      if (nextShared.lang === 'en' || nextShared.lang === 'fr') {
        setLang(nextShared.lang);
      }
      setIsClientLockedView(Boolean(nextShared.clientMode));
      setIsEditorOpen(false);
      setIsShareOpen(false);
      setIsSubmitted(false);
      setHasSubmittedOnce(false);
      setCurrentPageIdx(0);
      setMaxReachedIdx(0);
      setErrors({});
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!isClientLockedView) {
      try {
        localStorage.setItem(STORAGE_SCHEMA_KEY, JSON.stringify(schema));
      } catch {
        // Ignore storage errors
      }
    }
  }, [schema, isClientLockedView]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PRESETS_KEY, JSON.stringify(savedPresets));
    } catch {
      // Ignore storage errors
    }
  }, [savedPresets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THEME_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // Ignore
    }
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch {
      // Ignore
    }
  }, [lang]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const hasCustomizations = useMemo(() => {
    return JSON.stringify(schema) !== JSON.stringify(DEFAULT_BRIEF_SCHEMA);
  }, [schema]);

  const scrollToFormTop = () => {
    if (cardTopRef.current) {
      cardTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFieldChange = <K extends keyof BriefFormData>(
    field: K,
    value: BriefFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const handleCustomFieldChange = (fieldId: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      customAnswers: {
        ...prev.customAnswers,
        [fieldId]: value,
      },
    }));
    if (errors[`custom_${fieldId}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`custom_${fieldId}`];
        return next;
      });
    }
  };

  const validatePage = (pageId: 'page1' | 'page2'): boolean => {
    const newErrors: Record<string, string> = {};
    const sectionsOnPage: StepId[] =
      pageId === 'page1'
        ? (['general', 'project'] as StepId[]).filter((id) => enabledSectionIds.includes(id))
        : (['creative', 'print', 'inspiration'] as StepId[]).filter((id) =>
            enabledSectionIds.includes(id)
          );

    if (sectionsOnPage.includes('general')) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = t.errFullName;
      }
      if (!formData.brandName.trim()) {
        newErrors.brandName = t.errBrandName;
      }
      const phoneDigits = formData.whatsapp.replace(/[^\d]/g, '');
      if (!formData.whatsapp.trim()) {
        newErrors.whatsapp = t.errWhatsappRequired;
      } else if (phoneDigits.length < 8) {
        newErrors.whatsapp = t.errWhatsappInvalid;
      }
      if (
        formData.email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
      ) {
        newErrors.email = t.errEmailInvalid;
      }
    }

    const pageCustomFields = schema.customFields.filter(
      (f) => f.enabled && sectionsOnPage.includes(f.stepId) && f.required
    );
    for (const cf of pageCustomFields) {
      const val = formData.customAnswers[cf.id];
      const empty = Array.isArray(val) ? val.length === 0 : !val || !val.trim();
      if (empty) {
        newErrors[`custom_${cf.id}`] = t.errRequiredField;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextPage = () => {
    if (!validatePage(currentPage.id)) {
      scrollToFormTop();
      return;
    }
    const nextIdx = Math.min(safePageIdx + 1, formPages.length - 1);
    setCurrentPageIdx(nextIdx);
    setMaxReachedIdx((prev) => Math.max(prev, nextIdx));
    scrollToFormTop();
  };

  const handlePrevPage = () => {
    setErrors({});
    setCurrentPageIdx(Math.max(0, safePageIdx - 1));
    scrollToFormTop();
  };

  const handleSubmitBrief = (e: React.FormEvent) => {
    e.preventDefault();
    const isLast = safePageIdx === formPages.length - 1;
    if (!isLast) {
      handleNextPage();
      return;
    }
    if (!validatePage(currentPage.id)) {
      scrollToFormTop();
      return;
    }
    setIsSubmitted(true);
    setHasSubmittedOnce(true);
    scrollToFormTop();
  };

  const handleEditSectionFromSummary = (stepId: StepId) => {
    const targetPageIdx =
      stepId === 'general' || stepId === 'project' ? 0 : Math.min(1, formPages.length - 1);
    setCurrentPageIdx(targetPageIdx);
    setMaxReachedIdx(formPages.length - 1);
    setIsSubmitted(false);
    scrollToFormTop();
  };

  const handleResetForm = () => {
    setFormData(createInitialFormData(schema));
    setCurrentPageIdx(0);
    setMaxReachedIdx(0);
    setIsSubmitted(false);
    setHasSubmittedOnce(false);
    setErrors({});
    scrollToFormTop();
    showToast(t.toastNewBrief);
  };

  const handleSavePreset = (name: string, description: string) => {
    const newPreset: SavedPreset = {
      id: `preset-${Date.now().toString(36)}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      schema,
    };
    setSavedPresets((prev) => [newPreset, ...prev]);
    showToast(t.toastPresetSaved);
  };

  const handleDeletePreset = (id: string) => {
    setSavedPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const handleResetSchema = () => {
    setSchema(DEFAULT_BRIEF_SCHEMA);
    setFormData(createInitialFormData(DEFAULT_BRIEF_SCHEMA));
    setCurrentPageIdx(0);
    setMaxReachedIdx(0);
    showToast(t.toastReset);
  };

  const handleExportPdf = async (forceBlank = false) => {
    const isBlankMode =
      forceBlank ||
      (!isSubmitted &&
        !formData.fullName.trim() &&
        !formData.brandName.trim() &&
        !formData.projectDescription.trim());
    await generateBriefPdf(schema, formData, { blankTemplate: isBlankMode, lang });
    showToast(isBlankMode ? t.toastPdfTemplate : t.toastPdfReady);
  };

  const isLastPage = safePageIdx === formPages.length - 1;
  const getStepMeta = (id: StepId) => {
    const raw = schema.steps.find((s) => s.id === id);
    return raw ? getLocalizedStep(raw, lang) : undefined;
  };

  const sectionBannerClass = `rounded-xl border px-5 py-4 ${
    darkMode ? 'form-card-glass-dark' : 'form-card-glass'
  }`;

  return (
    <div
      className={`min-h-screen flex flex-col ${
        darkMode ? 'canvas-dark text-zinc-100' : 'canvas-light text-zinc-900'
      }`}
    >
      <HeaderHero
        agency={schema.agency}
        lang={lang}
        onChangeLang={(next) => {
          setLang(next);
          setErrors({});
        }}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        isEditorOpen={isEditorOpen}
        onToggleEditor={() => {
          setIsEditorOpen((o) => !o);
          setIsSubmitted(false);
        }}
        isClientLockedView={isClientLockedView}
        onOpenShareModal={() => setIsShareOpen(true)}
        onExportPdf={() => void handleExportPdf(isEditorOpen)}
        hasCustomizations={hasCustomizations}
      />

      <main ref={cardTopRef} className="flex-1 mx-auto w-full max-w-3xl px-4 pt-4 pb-10">
        {isEditorOpen ? (
          <AgencyEditor
            schema={schema}
            onUpdateSchema={setSchema}
            formData={formData}
            onUpdateFormData={handleFieldChange}
            savedPresets={savedPresets}
            onSavePreset={handleSavePreset}
            onDeletePreset={handleDeletePreset}
            onResetSchema={handleResetSchema}
            onCloseEditor={() => setIsEditorOpen(false)}
            onOpenShareModal={() => setIsShareOpen(true)}
            onExportBlankPdf={() => handleExportPdf(true)}
            lang={lang}
            darkMode={darkMode}
          />
        ) : isSubmitted ? (
          <ConfirmationView
            schema={schema}
            data={formData}
            activeSectionIds={enabledSectionIds}
            onEditSection={handleEditSectionFromSummary}
            onDownloadPdf={() => handleExportPdf(false)}
            onResetForm={handleResetForm}
            lang={lang}
            darkMode={darkMode}
          />
        ) : (
          <div className="space-y-4">
            <ProgressBar
              pages={formPages}
              currentPageIndex={safePageIdx}
              maxReachedIndex={maxReachedIdx}
              onSelectPage={(idx) => {
                setErrors({});
                setCurrentPageIdx(idx);
                scrollToFormTop();
              }}
              lang={lang}
              darkMode={darkMode}
            />

            <form onSubmit={handleSubmitBrief} noValidate className="space-y-6 animate-step-enter">
              {Object.keys(errors).length > 0 && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400">
                  {t.validationBanner}
                </div>
              )}

              {currentPage.id === 'page1' && (
                <>
                  <section className="space-y-4">
                    <div className={sectionBannerClass}>
                      <h2 className="font-display text-lg font-bold">
                        1. {getStepMeta('general')?.title || t.sec1}
                      </h2>
                      {getStepMeta('general')?.subtitle && (
                        <p
                          className={`mt-1 text-xs sm:text-sm ${
                            darkMode ? 'text-zinc-400' : 'text-zinc-500'
                          }`}
                        >
                          {getStepMeta('general')?.subtitle}
                        </p>
                      )}
                    </div>

                    <Step1General
                      schema={schema}
                      data={formData}
                      errors={errors}
                      onChange={handleFieldChange}
                      onCustomChange={handleCustomFieldChange}
                      lang={lang}
                      darkMode={darkMode}
                      isClientLockedView={isClientLockedView}
                      onOpenNeedsEditor={() => setIsEditorOpen(true)}
                    />
                  </section>

                  {enabledSectionIds.includes('project') && (
                    <section className="space-y-4 pt-2">
                      <div className={sectionBannerClass}>
                        <h2 className="font-display text-lg font-bold">
                          2. {getStepMeta('project')?.title || t.sec2}
                        </h2>
                        {getStepMeta('project')?.subtitle && (
                          <p
                            className={`mt-1 text-xs sm:text-sm ${
                              darkMode ? 'text-zinc-400' : 'text-zinc-500'
                            }`}
                          >
                            {getStepMeta('project')?.subtitle}
                          </p>
                        )}
                      </div>

                      <Step2Project
                        schema={schema}
                        data={formData}
                        errors={errors}
                        onChange={handleFieldChange}
                        onCustomChange={handleCustomFieldChange}
                        lang={lang}
                        darkMode={darkMode}
                      />
                    </section>
                  )}
                </>
              )}

              {currentPage.id === 'page2' && (
                <>
                  {enabledSectionIds.includes('creative') && (
                    <section className="space-y-4">
                      <div className={sectionBannerClass}>
                        <h2 className="font-display text-lg font-bold">
                          {getStepMeta('creative')?.title || t.sec3}
                        </h2>
                        {getStepMeta('creative')?.subtitle && (
                          <p
                            className={`mt-1 text-xs sm:text-sm ${
                              darkMode ? 'text-zinc-400' : 'text-zinc-500'
                            }`}
                          >
                            {getStepMeta('creative')?.subtitle}
                          </p>
                        )}
                      </div>

                      <Step3Creative
                        schema={schema}
                        data={formData}
                        errors={errors}
                        onChange={handleFieldChange}
                        onCustomChange={handleCustomFieldChange}
                        lang={lang}
                        darkMode={darkMode}
                      />
                    </section>
                  )}

                  {enabledSectionIds.includes('print') && (
                    <section className="space-y-4 pt-2">
                      <div className={sectionBannerClass}>
                        <h2 className="font-display text-lg font-bold">
                          {getStepMeta('print')?.title || t.sec4}
                        </h2>
                        {getStepMeta('print')?.subtitle && (
                          <p
                            className={`mt-1 text-xs sm:text-sm ${
                              darkMode ? 'text-zinc-400' : 'text-zinc-500'
                            }`}
                          >
                            {getStepMeta('print')?.subtitle}
                          </p>
                        )}
                      </div>

                      <Step4Print
                        schema={schema}
                        data={formData}
                        errors={errors}
                        onChange={handleFieldChange}
                        onCustomChange={handleCustomFieldChange}
                        lang={lang}
                        darkMode={darkMode}
                      />
                    </section>
                  )}

                  {enabledSectionIds.includes('inspiration') && (
                    <section className="space-y-4 pt-2">
                      <div className={sectionBannerClass}>
                        <h2 className="font-display text-lg font-bold">
                          {getStepMeta('inspiration')?.title || t.sec5}
                        </h2>
                        {getStepMeta('inspiration')?.subtitle && (
                          <p
                            className={`mt-1 text-xs sm:text-sm ${
                              darkMode ? 'text-zinc-400' : 'text-zinc-500'
                            }`}
                          >
                            {getStepMeta('inspiration')?.subtitle}
                          </p>
                        )}
                      </div>

                      <Step5Inspiration
                        schema={schema}
                        data={formData}
                        errors={errors}
                        onChange={handleFieldChange}
                        onCustomChange={handleCustomFieldChange}
                        lang={lang}
                        darkMode={darkMode}
                      />
                    </section>
                  )}
                </>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {safePageIdx > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevPage}
                      className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                        darkMode
                          ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                          : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      {t.prevBtn}
                    </button>
                  )}

                  {hasSubmittedOnce && !isLastPage && (
                    <button
                      type="button"
                      onClick={() => {
                        if (validatePage(currentPage.id)) {
                          setIsSubmitted(true);
                          scrollToFormTop();
                        }
                      }}
                      className="rounded-lg border border-teal-700 px-3.5 py-2.5 text-sm font-medium text-teal-700 dark:text-teal-400 cursor-pointer"
                    >
                      {t.backToSummary}
                    </button>
                  )}
                </div>

                {!isLastPage ? (
                  <button
                    key="btn-next-page"
                    type="button"
                    onClick={handleNextPage}
                    className="ml-auto rounded-lg bg-teal-700 hover:bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
                  >
                    {t.nextBtn}
                  </button>
                ) : (
                  <button
                    key="btn-submit-brief"
                    type="submit"
                    className="ml-auto rounded-lg bg-teal-700 hover:bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
                  >
                    {t.submitPrefix} {schema.agency.agencyName}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </main>

      <StudioFooter
        agency={schema.agency}
        lang={lang}
        darkMode={darkMode}
        isClientLockedView={isClientLockedView}
        onUnlockAgencyMode={() => {
          setIsClientLockedView(false);
          setIsEditorOpen(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        schema={schema}
        formData={formData}
        onUpdateGreeting={(note) =>
          setSchema((prev) => ({
            ...prev,
            agency: { ...prev.agency, clientGreetingNote: note },
          }))
        }
        onExportBlankPdf={() => handleExportPdf(true)}
        lang={lang}
        darkMode={darkMode}
      />

      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-xs font-medium text-white shadow-lg animate-pop-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

export default App;
