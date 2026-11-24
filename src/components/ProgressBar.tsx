import React from 'react';
import { Language } from '../types/brief';
import { UI_TEXT } from '../data/translations';

export interface FormPageMeta {
  id: 'page1' | 'page2';
  title: string;
  shortTitle: string;
}

interface ProgressBarProps {
  pages: FormPageMeta[];
  currentPageIndex: number;
  maxReachedIndex: number;
  onSelectPage: (index: number) => void;
  lang: Language;
  darkMode: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  pages,
  currentPageIndex,
  maxReachedIndex,
  onSelectPage,
  lang,
  darkMode,
}) => {
  const t = UI_TEXT[lang];
  const total = pages.length;
  const percent = total > 0 ? Math.round(((currentPageIndex + 1) / total) * 100) : 100;

  return (
    <div
      className={`rounded-xl border px-5 py-4 ${
        darkMode ? 'form-card-glass-dark' : 'form-card-glass'
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-xs sm:text-sm mb-2.5">
        <span className={`font-semibold ${darkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
          {t.pageLabel} {currentPageIndex + 1} {t.ofLabel} {total} — {pages[currentPageIndex]?.title}
        </span>
        <span className={`font-mono-code text-xs ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {percent}%
        </span>
      </div>

      <div
        className={`h-1.5 w-full overflow-hidden rounded-full ${
          darkMode ? 'bg-zinc-800' : 'bg-zinc-100'
        }`}
      >
        <div
          className="h-full rounded-full bg-teal-700 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {total > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {pages.map((page, idx) => {
            const isCurrent = idx === currentPageIndex;
            const isClickable = idx <= maxReachedIndex;

            return (
              <button
                key={page.id}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onSelectPage(idx)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  isCurrent
                    ? 'bg-teal-700 text-white'
                    : isClickable
                    ? darkMode
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 cursor-pointer'
                    : darkMode
                    ? 'text-zinc-600 cursor-not-allowed'
                    : 'text-zinc-400 cursor-not-allowed'
                }`}
              >
                {t.pageLabel} {idx + 1} : {page.shortTitle}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
