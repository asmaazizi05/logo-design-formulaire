import React from 'react';
import { AgencyConfig, Language } from '../types/brief';
import { UI_TEXT } from '../data/translations';

interface StudioFooterProps {
  agency: AgencyConfig;
  lang: Language;
  darkMode: boolean;
  isClientLockedView: boolean;
  onUnlockAgencyMode: () => void;
}

export const StudioFooter: React.FC<StudioFooterProps> = ({
  agency,
  lang,
  darkMode,
  isClientLockedView,
  onUnlockAgencyMode,
}) => {
  const t = UI_TEXT[lang];
  const cleanPhone = agency.whatsappNumber.replace(/[^\d]/g, '') || '212771663435';

  return (
    <footer
      className={`mt-10 border-t py-6 text-center text-xs ${
        darkMode ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'
      }`}
    >
      <div className="mx-auto max-w-3xl px-4 space-y-2">
        <p className="font-medium">
          {agency.agencyName} •{' '}
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-teal-700"
          >
            WhatsApp {agency.whatsappDisplay}
          </a>{' '}
          • {agency.email} • IG {agency.instagram} • FB {agency.facebook}
        </p>

        {isClientLockedView && (
          <div>
            <button
              type="button"
              onClick={onUnlockAgencyMode}
              className="text-[11px] opacity-75 hover:opacity-100 underline underline-offset-2 cursor-pointer"
            >
              {t.unlockAgency}
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};
