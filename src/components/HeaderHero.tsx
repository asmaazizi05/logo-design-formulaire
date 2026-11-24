import React from 'react';
import headerBanner from '../assets/header-banner.jpg';
import { AgencyConfig, Language } from '../types/brief';
import { getLocalizedAgency, UI_TEXT } from '../data/translations';

interface HeaderHeroProps {
  agency: AgencyConfig;
  lang: Language;
  onChangeLang: (next: Language) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isEditorOpen: boolean;
  onToggleEditor: () => void;
  isClientLockedView: boolean;
  onOpenShareModal: () => void;
  onExportPdf: () => void;
  hasCustomizations: boolean;
}

export const HeaderHero: React.FC<HeaderHeroProps> = ({
  agency,
  lang,
  onChangeLang,
  darkMode,
  onToggleDarkMode,
  isEditorOpen,
  onToggleEditor,
  isClientLockedView,
  onOpenShareModal,
  onExportPdf,
  hasCustomizations,
}) => {
  const t = UI_TEXT[lang];
  const localizedAgency = getLocalizedAgency(agency, lang);

  return (
    <>
      {/* Quiet Top Bar */}
      <nav
        className={`border-b ${
          darkMode
            ? 'bg-[#181a1f] border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <span className="font-display text-sm sm:text-base font-bold tracking-tight whitespace-nowrap">
            {localizedAgency.agencyName}
          </span>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Language Switcher FR / EN */}
            <div
              role="group"
              aria-label={lang === 'fr' ? 'Langue' : 'Language'}
              className={`inline-flex rounded-lg border p-0.5 text-xs font-semibold ${
                darkMode ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-zinc-100'
              }`}
            >
              <button
                type="button"
                onClick={() => onChangeLang('fr')}
                className={`rounded-md px-2 py-1 transition-colors cursor-pointer ${
                  lang === 'fr'
                    ? 'bg-teal-700 text-white'
                    : darkMode
                    ? 'text-zinc-400 hover:text-zinc-100'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                className={`rounded-md px-2 py-1 transition-colors cursor-pointer ${
                  lang === 'en'
                    ? 'bg-teal-700 text-white'
                    : darkMode
                    ? 'text-zinc-400 hover:text-zinc-100'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                EN
              </button>
            </div>

            {!isClientLockedView && (
              <>
                <button
                  type="button"
                  onClick={onToggleEditor}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    isEditorOpen
                      ? 'border-teal-700 bg-teal-700 text-white'
                      : darkMode
                      ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {isEditorOpen ? (
                    <span>{t.viewForm}</span>
                  ) : (
                    <>
                      <span className="sm:hidden">{t.editShort}</span>
                      <span className="hidden sm:inline">{t.editAndNeeds}</span>
                    </>
                  )}
                  {!isEditorOpen && hasCustomizations && (
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onOpenShareModal}
                  className="rounded-lg bg-teal-700 hover:bg-teal-800 text-white px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  {t.share}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onExportPdf}
              className={`rounded-lg border px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                darkMode
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              {t.pdf}
            </button>

            <button
              type="button"
              onClick={onToggleDarkMode}
              className={`rounded-lg border px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                darkMode
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {darkMode ? t.light : t.dark}
            </button>
          </div>
        </div>
      </nav>

      {/* Google-Forms Header Card with Frosted Glass Fade (100% -> 0% photo opacity) */}
      <header className="mx-auto w-full max-w-3xl px-4 pt-6">
        <div
          className={`relative overflow-hidden rounded-xl border ${
            darkMode
              ? 'form-card-glass-dark text-zinc-100'
              : 'form-card-glass text-zinc-900'
          }`}
        >
          <div className="relative z-20 h-1.5 w-full bg-teal-700" />

          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <img
              src={headerBanner}
              alt="Logo Design"
              className="h-full w-full object-cover object-[center_72%] sm:object-[center_65%] block"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 48%, rgba(0,0,0,0) 100%)',
                maskImage:
                  'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 48%, rgba(0,0,0,0) 100%)',
              }}
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-36 backdrop-blur-[10px]"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
                maskImage:
                  'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
                background: darkMode
                  ? 'linear-gradient(to bottom, rgba(24,26,31,0) 0%, rgba(24,26,31,0.68) 55%, rgba(24,26,31,1) 100%)'
                  : 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.68) 55%, rgba(255,255,255,1) 100%)',
              }}
            />
          </div>

          <div className="relative z-10 -mt-12 px-6 pb-6 sm:px-7 sm:pb-7">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              {localizedAgency.heroTitle}
            </h1>

            <p
              className={`mt-2.5 text-sm sm:text-[15px] leading-relaxed ${
                darkMode ? 'text-zinc-300' : 'text-zinc-600'
              }`}
            >
              {localizedAgency.heroSubtitle}
            </p>

            {localizedAgency.clientGreetingNote?.trim() && (
              <div
                className={`mt-4 rounded-lg border-l-4 border-teal-700 px-3.5 py-2.5 text-sm ${
                  darkMode ? 'bg-zinc-900 text-zinc-200' : 'bg-zinc-50 text-zinc-800'
                }`}
              >
                {localizedAgency.clientGreetingNote}
              </div>
            )}

            <div
              className={`mt-4 pt-3.5 border-t flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${
                darkMode
                  ? 'border-zinc-800 text-zinc-400'
                  : 'border-zinc-100 text-zinc-500'
              }`}
            >
              <span>Instagram : {localizedAgency.instagram}</span>
              <span>Facebook : {localizedAgency.facebook}</span>
              <span>WhatsApp : {localizedAgency.whatsappDisplay}</span>
              <span className="ml-auto text-rose-500 font-medium">{t.requiredMark}</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
