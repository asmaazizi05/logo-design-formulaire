import React, { useMemo, useState } from 'react';
import { BriefFormData, BriefSchema, Language } from '../types/brief';
import { UI_TEXT } from '../data/translations';
import { encodeShareLink } from '../utils/shareLink';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: BriefSchema;
  formData: BriefFormData;
  onUpdateGreeting: (note: string) => void;
  onExportBlankPdf: () => Promise<void>;
  lang: Language;
  darkMode: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  schema,
  formData,
  onUpdateGreeting,
  onExportBlankPdf,
  lang,
  darkMode,
}) => {
  const t = UI_TEXT[lang];
  const [includeCurrentPrefill, setIncludeCurrentPrefill] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl = useMemo(() => {
    if (!isOpen) return '';
    return encodeShareLink(
      schema,
      includeCurrentPrefill ? formData : undefined,
      true,
      lang
    );
  }, [isOpen, schema, formData, includeCurrentPrefill, lang]);

  if (!isOpen) return null;

  const isLocalhost =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const whatsappInviteText =
    lang === 'en'
      ? `Hello! Here is the link to your creative brief form with ${schema.agency.agencyName}:\n\n${shareUrl}`
      : `Bonjour ! Voici le lien vers votre formulaire de brief créatif chez ${schema.agency.agencyName} :\n\n${shareUrl}`;
  const whatsappInviteUrl = `https://wa.me/?text=${encodeURIComponent(whatsappInviteText)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div
        className={`relative w-full max-w-lg rounded-xl border p-6 shadow-xl animate-pop-in ${
          darkMode
            ? 'bg-[#181a1f] border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-200/70 dark:border-zinc-800">
          <div>
            <h3 id="share-modal-title" className="font-display text-lg font-bold">
              {t.shareTitle}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{t.shareSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="rounded-lg border border-transparent px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-500/10 cursor-pointer"
          >
            {t.close}
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              {t.greetingLabel}
            </label>
            <input
              type="text"
              value={schema.agency.clientGreetingNote}
              onChange={(e) => onUpdateGreeting(e.target.value)}
              placeholder={t.greetingPlaceholder}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                darkMode
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-teal-500'
                  : 'bg-white border-zinc-300 text-zinc-900 focus:border-teal-700'
              }`}
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeCurrentPrefill}
              onChange={(e) => setIncludeCurrentPrefill(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-teal-700"
            />
            <span className={darkMode ? 'text-zinc-300' : 'text-zinc-700'}>
              {t.includePrefill}
            </span>
          </label>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              {t.clientLinkLabel}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-mono-code outline-none ${
                  darkMode
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                }`}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 rounded-lg bg-teal-700 hover:bg-teal-800 px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                {copiedLink ? t.copied : t.copyBtn}
              </button>
            </div>
            {isLocalhost && (
              <p className="mt-2 text-[11px] text-zinc-500">{t.localhostNote}</p>
            )}
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={whatsappInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-teal-700 hover:bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              {t.sendViaWhatsapp}
            </a>

            <button
              type="button"
              onClick={() => void onExportBlankPdf()}
              className={`inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                darkMode
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                  : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'
              }`}
            >
              {t.exportSheetPdf}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
