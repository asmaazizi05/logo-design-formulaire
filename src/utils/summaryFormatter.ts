import { BriefFormData, BriefSchema, Language, SimpleOption, StepId } from '../types/brief';
import { DEFAULT_BRIEF_SCHEMA } from '../data/defaultSchema';
import {
  getLocalizedOptionLabel,
  getLocalizedService,
  getLocalizedStyle,
  UI_TEXT,
} from '../data/translations';

export function formatFileSize(bytes: number, lang: Language = 'fr'): string {
  const kb = lang === 'en' ? 'KB' : 'Ko';
  const mb = lang === 'en' ? 'MB' : 'Mo';
  const b = lang === 'en' ? 'B' : 'o';
  if (bytes < 1024) return `${bytes} ${b}`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ${kb}`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ${mb}`;
}

export function resolveSelectedServiceLabels(
  schema: BriefSchema,
  ids: string[],
  lang: Language = 'fr'
): string[] {
  return ids.map((id) => {
    const srv = schema.services.find((s) => s.id === id);
    return srv ? getLocalizedService(srv, lang).title : id;
  });
}

export function resolveSelectedStyleLabels(
  schema: BriefSchema,
  ids: string[],
  lang: Language = 'fr'
): string[] {
  return ids.map((id) => {
    const st = schema.styles.find((s) => s.id === id);
    return st ? getLocalizedStyle(st, lang).title : id;
  });
}

export function resolveOptionLabels(
  options: SimpleOption[],
  ids: string[],
  lang: Language = 'fr',
  defaults: SimpleOption[] = []
): string[] {
  return ids.map((id) => {
    const opt = options.find((o) => o.id === id);
    return opt ? getLocalizedOptionLabel(opt, defaults, lang) : id;
  });
}

export function resolveSingleOptionLabel(
  options: SimpleOption[],
  id: string,
  lang: Language = 'fr',
  defaults: SimpleOption[] = []
): string {
  if (!id) return '';
  const opt = options.find((o) => o.id === id);
  return opt ? getLocalizedOptionLabel(opt, defaults, lang) : id;
}

export function isStepEnabled(schema: BriefSchema, stepId: StepId): boolean {
  return schema.steps.find((s) => s.id === stepId)?.enabled ?? true;
}

export function formatBriefTextSummary(
  schema: BriefSchema,
  data: BriefFormData,
  lang: Language = 'fr'
): string {
  const t = UI_TEXT[lang];
  const lines: string[] = [];
  const divider = '------------------------------';

  lines.push(
    lang === 'en'
      ? `*CREATIVE BRIEF — ${schema.agency.agencyName.toUpperCase()}*`
      : `*BRIEF CRÉATIF — ${schema.agency.agencyName.toUpperCase()}*`
  );
  lines.push(`${t.refLabel} : ${data.referenceCode}`);
  lines.push(divider);

  // 1. General
  lines.push('');
  lines.push(`*${t.sec1.toUpperCase()}*`);
  lines.push(`- ${t.fullName} : ${data.fullName || t.notProvided}`);
  lines.push(`- ${t.brandName} : ${data.brandName || t.notProvided}`);
  lines.push(`- WhatsApp : ${data.whatsapp || t.notProvided}`);
  if (data.email.trim()) {
    lines.push(`- ${t.email} : ${data.email}`);
  }

  const services = resolveSelectedServiceLabels(schema, data.selectedServices, lang);
  lines.push(
    `- ${t.servicesWanted} : ${services.length > 0 ? services.join(', ') : t.notSpecified}`
  );
  if (data.customNeedNote.trim()) {
    lines.push(`- ${t.otherNeed} : ${data.customNeedNote.trim()}`);
  }
  appendCustomFieldsSummary(schema, data, 'general', lines);

  // 2. Project & Target
  if (isStepEnabled(schema, 'project')) {
    lines.push('');
    lines.push(`*${t.sec2.toUpperCase()}*`);
    lines.push(`- ${t.sumActivity} : ${data.projectDescription.trim() || t.notProvided}`);
    lines.push(`- ${t.sumTarget} : ${data.targetAudience.trim() || t.notProvided}`);
    lines.push(`- ${t.sumExactText} : ${data.exactTextToInclude.trim() || t.notProvided}`);
    appendCustomFieldsSummary(schema, data, 'project', lines);
  }

  // 3. Creative Direction
  if (isStepEnabled(schema, 'creative')) {
    lines.push('');
    lines.push(`*${t.sec3.toUpperCase()}*`);
    const styles = resolveSelectedStyleLabels(schema, data.selectedStyles, lang);
    lines.push(`- ${t.visualStyle} : ${styles.length > 0 ? styles.join(', ') : t.notSpecified}`);
    lines.push(`- ${t.sumColors} : ${data.colorPreferences.trim() || t.notProvided}`);
    const existingLogo = resolveSingleOptionLabel(
      schema.existingLogoOptions,
      data.hasExistingLogo,
      lang,
      DEFAULT_BRIEF_SCHEMA.existingLogoOptions
    );
    lines.push(`- ${t.sumExistingLogo} : ${existingLogo || t.notSpecified}`);
    appendCustomFieldsSummary(schema, data, 'creative', lines);
  }

  // 4. Print Specs
  if (isStepEnabled(schema, 'print')) {
    lines.push('');
    lines.push(`*${t.sec4.toUpperCase()}*`);
    const supports = resolveOptionLabels(
      schema.printSupports,
      data.printSupports,
      lang,
      DEFAULT_BRIEF_SCHEMA.printSupports
    );
    lines.push(`- ${t.sumSupports} : ${supports.length > 0 ? supports.join(', ') : t.notSpecified}`);
    if (data.printDimensions.trim()) {
      lines.push(`- ${t.sumDimensions} : ${data.printDimensions.trim()}`);
    }
    const printer = resolveSingleOptionLabel(
      schema.printerSituations,
      data.printerSituation,
      lang,
      DEFAULT_BRIEF_SCHEMA.printerSituations
    );
    if (printer) {
      lines.push(`- ${t.sumPrinter} : ${printer}`);
    }
    const finishes = resolveOptionLabels(
      schema.printFinishes,
      data.printFinishes,
      lang,
      DEFAULT_BRIEF_SCHEMA.printFinishes
    );
    if (finishes.length > 0) {
      lines.push(`- ${t.sumFinishes} : ${finishes.join(', ')}`);
    }
    appendCustomFieldsSummary(schema, data, 'print', lines);
  }

  // 5. Inspirations & Deadline
  if (isStepEnabled(schema, 'inspiration')) {
    lines.push('');
    lines.push(`*${t.sec5.toUpperCase()}*`);
    if (data.inspirationNotes.trim()) {
      lines.push(`- ${t.sumInspirations} : ${data.inspirationNotes.trim()}`);
    }
    if (data.uploadedFiles.length > 0) {
      const fileNames = data.uploadedFiles
        .map((f) => `${f.name} (${formatFileSize(f.size, lang)})`)
        .join(', ');
      lines.push(`- ${t.attachedFiles} (${data.uploadedFiles.length}) : ${fileNames}`);
    }
    lines.push(`- ${t.sumDeadline} : ${data.deadline.trim() || t.flexible}`);
    appendCustomFieldsSummary(schema, data, 'inspiration', lines);
  }

  lines.push('');
  lines.push(divider);
  lines.push(
    lang === 'en'
      ? `Sent via ${schema.agency.agencyName} Creative Brief`
      : `Envoyé via le Brief Créatif ${schema.agency.agencyName}`
  );

  return lines.join('\n');
}

function appendCustomFieldsSummary(
  schema: BriefSchema,
  data: BriefFormData,
  stepId: StepId,
  lines: string[]
) {
  const fields = schema.customFields.filter((f) => f.enabled && f.stepId === stepId);
  for (const field of fields) {
    const val = data.customAnswers[field.id];
    const formatted = Array.isArray(val) ? val.join(', ') : (val || '').trim();
    if (formatted) {
      lines.push(`- ${field.label} : ${formatted}`);
    }
  }
}

export function buildWhatsAppUrl(
  whatsappNumber: string,
  summaryText: string,
  lang: Language = 'fr'
): { url: string; wasTruncated: boolean } {
  const cleanPhone = whatsappNumber.replace(/[^\d]/g, '') || '212771663435';
  const maxChars = 1900;
  let finalText = summaryText;
  let wasTruncated = false;

  if (finalText.length > maxChars) {
    wasTruncated = true;
    finalText =
      finalText.slice(0, maxChars - 120) +
      (lang === 'en'
        ? '\n...\n[Full details available in the downloaded PDF]'
        : '\n...\n[Suite disponible dans le PDF téléchargé]');
  }

  return {
    url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalText)}`,
    wasTruncated,
  };
}
