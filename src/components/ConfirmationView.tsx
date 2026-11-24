import React, { useState } from 'react';
import { BriefFormData, BriefSchema, Language, StepId } from '../types/brief';
import { DEFAULT_BRIEF_SCHEMA } from '../data/defaultSchema';
import { UI_TEXT } from '../data/translations';
import {
  buildWhatsAppUrl,
  formatBriefTextSummary,
  formatFileSize,
  isStepEnabled,
  resolveOptionLabels,
  resolveSelectedServiceLabels,
  resolveSelectedStyleLabels,
  resolveSingleOptionLabel,
} from '../utils/summaryFormatter';

interface ConfirmationViewProps {
  schema: BriefSchema;
  data: BriefFormData;
  activeSectionIds: StepId[];
  onEditSection: (stepId: StepId) => void;
  onDownloadPdf: () => Promise<void>;
  onResetForm: () => void;
  lang: Language;
  darkMode: boolean;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  schema,
  data,
  activeSectionIds,
  onEditSection,
  onDownloadPdf,
  onResetForm,
  lang,
  darkMode,
}) => {
  const t = UI_TEXT[lang];
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const summaryText = formatBriefTextSummary(schema, data, lang);
  const { url: whatsappUrl, wasTruncated } = buildWhatsAppUrl(
    schema.agency.whatsappNumber,
    summaryText,
    lang
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = summaryText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePdfClick = async () => {
    setPdfLoading(true);
    try {
      await onDownloadPdf();
    } finally {
      setPdfLoading(false);
    }
  };

  const serviceLabels = resolveSelectedServiceLabels(schema, data.selectedServices, lang);
  const styleLabels = resolveSelectedStyleLabels(schema, data.selectedStyles, lang);
  const existingLogoLabel = resolveSingleOptionLabel(
    schema.existingLogoOptions,
    data.hasExistingLogo,
    lang,
    DEFAULT_BRIEF_SCHEMA.existingLogoOptions
  );
  const printSupportLabels = resolveOptionLabels(
    schema.printSupports,
    data.printSupports,
    lang,
    DEFAULT_BRIEF_SCHEMA.printSupports
  );
  const printerLabel = resolveSingleOptionLabel(
    schema.printerSituations,
    data.printerSituation,
    lang,
    DEFAULT_BRIEF_SCHEMA.printerSituations
  );
  const finishLabels = resolveOptionLabels(
    schema.printFinishes,
    data.printFinishes,
    lang,
    DEFAULT_BRIEF_SCHEMA.printFinishes
  );

  const cardClass = `rounded-xl border p-5 sm:p-6 ${
    darkMode ? 'form-card-glass-dark' : 'form-card-glass'
  }`;

  const canJumpToSection = (id: StepId) => activeSectionIds.includes(id);

  const renderCustomAnswers = (stepId: StepId) => {
    const fields = schema.customFields.filter((f) => f.enabled && f.stepId === stepId);
    if (fields.length === 0) return null;
    return (
      <div className="mt-3 pt-3 border-t border-zinc-200/70 dark:border-zinc-800 space-y-2">
        {fields.map((f) => {
          const val = data.customAnswers[f.id];
          const formatted = Array.isArray(val) ? val.join(', ') : val || t.notProvided;
          return (
            <div key={f.id}>
              <span className="text-xs font-medium text-zinc-400">{f.label} : </span>
              <span className={`text-sm ${darkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                {formatted}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-step-enter">
      <div
        className={`overflow-hidden rounded-xl border ${
          darkMode ? 'form-card-glass-dark' : 'form-card-glass'
        }`}
      >
        <div className="h-2 w-full bg-teal-700" />
        <div className="p-6 sm:p-7">
          <div className="text-teal-700 dark:text-teal-400 text-xs font-mono-code font-semibold uppercase tracking-wide mb-2">
            {t.refLabel} : {data.referenceCode}
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-bold">{t.readyTitle}</h2>
          <p className={`mt-1.5 text-sm ${darkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            {t.readyThanks1} <strong>{data.fullName}</strong> {t.readyThanks2}{' '}
            <strong>{data.brandName}</strong>. {t.readyThanks3}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-teal-700 hover:bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors whitespace-nowrap"
            >
              {t.sendWhatsapp}
            </a>

            <button
              type="button"
              onClick={handlePdfClick}
              disabled={pdfLoading}
              className={`inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 ${
                darkMode
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                  : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'
              }`}
            >
              {pdfLoading ? t.generatingPdf : t.downloadPdf}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                copied
                  ? 'border-teal-700 bg-teal-700/10 text-teal-700 dark:text-teal-400'
                  : darkMode
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              {copied ? t.copied : t.copySummary}
            </button>
          </div>

          <p className="mt-3 text-xs text-zinc-400">
            {t.waRecipient} : {schema.agency.whatsappDisplay}
          </p>

          {(data.uploadedFiles.length > 0 || wasTruncated) && (
            <p className="mt-2 text-xs text-zinc-500">{t.filesPdfTip}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-1 pt-2">
        <h3 className="font-display text-base font-bold">{t.summaryTitle}</h3>
        <button
          type="button"
          onClick={onResetForm}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer ${
            darkMode
              ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white'
              : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900'
          }`}
        >
          {t.newBrief}
        </button>
      </div>

      <div className={cardClass}>
        <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-zinc-200/70 dark:border-zinc-800">
          <h4 className="font-display text-sm font-bold">{t.sec1}</h4>
          {canJumpToSection('general') && (
            <button
              type="button"
              onClick={() => onEditSection('general')}
              className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
            >
              {t.editBtn}
            </button>
          )}
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-zinc-400">{t.fullName}</dt>
            <dd className="mt-0.5 font-medium">{data.fullName || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">{t.brandName}</dt>
            <dd className="mt-0.5 font-medium">{data.brandName || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">WhatsApp</dt>
            <dd className="mt-0.5 font-medium">{data.whatsapp || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">{t.email}</dt>
            <dd className="mt-0.5 font-medium">{data.email || t.notProvided}</dd>
          </div>
        </dl>

        <div className="mt-4 text-sm">
          <dt className="text-xs text-zinc-400 mb-1">{t.servicesWanted}</dt>
          <dd className="font-medium">
            {serviceLabels.length > 0 ? serviceLabels.join(' • ') : t.noService}
          </dd>
          {data.customNeedNote.trim() && (
            <p className="mt-2 text-xs text-zinc-500">
              {t.otherNeed} : {data.customNeedNote}
            </p>
          )}
        </div>
        {renderCustomAnswers('general')}
      </div>

      {isStepEnabled(schema, 'project') && (
        <div className={cardClass}>
          <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-zinc-200/70 dark:border-zinc-800">
            <h4 className="font-display text-sm font-bold">{t.sec2}</h4>
            {canJumpToSection('project') && (
              <button
                type="button"
                onClick={() => onEditSection('project')}
                className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
              >
                {t.editBtn}
              </button>
            )}
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-zinc-400">{t.sumActivity}</dt>
              <dd className="mt-0.5 whitespace-pre-line">
                {data.projectDescription || t.notProvided}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400">{t.sumTarget}</dt>
              <dd className="mt-0.5">{data.targetAudience || t.notProvided}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400">{t.sumExactText}</dt>
              <dd className="mt-0.5 whitespace-pre-line">
                {data.exactTextToInclude || t.notProvided}
              </dd>
            </div>
          </dl>
          {renderCustomAnswers('project')}
        </div>
      )}

      {isStepEnabled(schema, 'creative') && (
        <div className={cardClass}>
          <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-zinc-200/70 dark:border-zinc-800">
            <h4 className="font-display text-sm font-bold">{t.sec3}</h4>
            {canJumpToSection('creative') && (
              <button
                type="button"
                onClick={() => onEditSection('creative')}
                className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
              >
                {t.editBtn}
              </button>
            )}
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-zinc-400">{t.visualStyle}</dt>
              <dd className="mt-0.5 font-medium">
                {styleLabels.length > 0 ? styleLabels.join(' • ') : t.notSpecified}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400">{t.sumColors}</dt>
              <dd className="mt-0.5">{data.colorPreferences || t.notProvided}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400">{t.sumExistingLogo}</dt>
              <dd className="mt-0.5">{existingLogoLabel || t.notSpecified}</dd>
            </div>
          </dl>
          {renderCustomAnswers('creative')}
        </div>
      )}

      {isStepEnabled(schema, 'print') && (
        <div className={cardClass}>
          <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-zinc-200/70 dark:border-zinc-800">
            <h4 className="font-display text-sm font-bold">{t.sec4}</h4>
            {canJumpToSection('print') && (
              <button
                type="button"
                onClick={() => onEditSection('print')}
                className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
              >
                {t.editBtn}
              </button>
            )}
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-zinc-400">{t.sumSupports}</dt>
              <dd className="mt-0.5">
                {printSupportLabels.length > 0 ? printSupportLabels.join(' • ') : t.notSpecified}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400">{t.sumDimensions}</dt>
              <dd className="mt-0.5">{data.printDimensions || t.notSpecified}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400">{t.sumPrinter}</dt>
              <dd className="mt-0.5">{printerLabel || t.notSpecified}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400">{t.sumFinishes}</dt>
              <dd className="mt-0.5">
                {finishLabels.length > 0 ? finishLabels.join(' • ') : t.notSpecified}
              </dd>
            </div>
          </dl>
          {renderCustomAnswers('print')}
        </div>
      )}

      {isStepEnabled(schema, 'inspiration') && (
        <div className={cardClass}>
          <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-zinc-200/70 dark:border-zinc-800">
            <h4 className="font-display text-sm font-bold">{t.sec5}</h4>
            {canJumpToSection('inspiration') && (
              <button
                type="button"
                onClick={() => onEditSection('inspiration')}
                className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
              >
                {t.editBtn}
              </button>
            )}
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-zinc-400">{t.sumInspirations}</dt>
              <dd className="mt-0.5 whitespace-pre-line">
                {data.inspirationNotes || t.notProvided}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400">{t.sumDeadline}</dt>
              <dd className="mt-0.5 font-medium">{data.deadline || t.flexible}</dd>
            </div>
            {data.uploadedFiles.length > 0 && (
              <div>
                <dt className="text-xs text-zinc-400 mb-1.5">
                  {t.attachedFiles} ({data.uploadedFiles.length})
                </dt>
                <div className="flex flex-wrap gap-2">
                  {data.uploadedFiles.map((f) => (
                    <div
                      key={f.id}
                      className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${
                        darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'
                      }`}
                    >
                      {f.previewDataUrl && (
                        <img
                          src={f.previewDataUrl}
                          alt={f.name}
                          className="h-6 w-6 rounded object-cover"
                        />
                      )}
                      <span className="max-w-[160px] truncate">{f.name}</span>
                      <span className="text-zinc-400">({formatFileSize(f.size, lang)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </dl>
          {renderCustomAnswers('inspiration')}
        </div>
      )}
    </div>
  );
};
