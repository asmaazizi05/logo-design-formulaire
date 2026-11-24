import { BriefFormData, BriefSchema, Language, StepId } from '../types/brief';
import { DEFAULT_BRIEF_SCHEMA } from '../data/defaultSchema';
import {
  getLocalizedOptionLabel,
  getLocalizedService,
  getLocalizedStep,
  getLocalizedStyle,
  UI_TEXT,
} from '../data/translations';
import {
  formatFileSize,
  isStepEnabled,
  resolveOptionLabels,
  resolveSelectedServiceLabels,
  resolveSelectedStyleLabels,
  resolveSingleOptionLabel,
} from './summaryFormatter';

function sanitizePdfText(input: string): string {
  if (!input) return '';
  return input
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/•/g, '-')
    .replace(/[✓✔]/g, '[x]')
    .replace(/[“”]/g, '"')
    .replace(/[’‘]/g, "'")
    .replace(/–|—/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF\u20AC\u2018-\u201E]/g, '')
    .replace(/\s{2,}/g, (match, offset, str) => {
      return str[offset - 1] === '\n' ? match : ' ';
    })
    .trim();
}

interface GeneratePdfOptions {
  blankTemplate?: boolean;
  lang?: Language;
}

export async function generateBriefPdf(
  schema: BriefSchema,
  data: BriefFormData,
  options: GeneratePdfOptions = {}
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const lang: Language = options.lang || 'fr';
  const t = UI_TEXT[lang];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const maxPageCount = 2;
  let y = 0;

  const isBlank = Boolean(options.blankTemplate);
  const nowDate = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const INK: [number, number, number] = [17, 24, 39];
  const ACCENT: [number, number, number] = [15, 118, 110];
  const MUTED: [number, number, number] = [107, 114, 128];
  const BORDER: [number, number, number] = [229, 231, 235];
  const SOFT_BG: [number, number, number] = [249, 250, 251];
  const ACCENT_TINT: [number, number, number] = [240, 253, 250];

  const ensureSpace = (neededMm: number): boolean => {
    if (y + neededMm <= pageHeight - 15) return true;
    if (doc.getNumberOfPages() >= maxPageCount) return false;
    doc.addPage();
    y = 14;
    return true;
  };

  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  y = 11.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text(sanitizePdfText(schema.agency.agencyName.toUpperCase()), margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    lang === 'en'
      ? isBlank
        ? 'Creative Brief Template (To Complete)'
        : 'Client Creative Brief'
      : isBlank
      ? 'Fiche de Brief Creatif (A completer)'
      : 'Dossier de Brief Creatif Client',
    margin,
    y + 4.8
  );

  const rightX = pageWidth - margin;
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`WhatsApp : ${sanitizePdfText(schema.agency.whatsappDisplay)}`, rightX, y - 1.5, {
    align: 'right',
  });
  doc.text(
    `IG : ${sanitizePdfText(schema.agency.instagram)}  |  FB : ${sanitizePdfText(schema.agency.facebook)}`,
    rightX,
    y + 2.5,
    { align: 'right' }
  );
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...ACCENT);
  doc.text(`Ref : ${sanitizePdfText(data.referenceCode)}  |  ${nowDate}`, rightX, y + 6.8, {
    align: 'right',
  });

  y += 11;
  doc.setDrawColor(...BORDER);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  if (schema.agency.clientGreetingNote?.trim()) {
    const noteText = sanitizePdfText(schema.agency.clientGreetingNote);
    const noteLines = doc.splitTextToSize(noteText, contentWidth - 8);
    const boxH = noteLines.length * 4 + 5;
    if (ensureSpace(boxH + 4)) {
      doc.setFillColor(...ACCENT_TINT);
      doc.setDrawColor(...ACCENT);
      doc.roundedRect(margin, y, contentWidth, boxH, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...INK);
      doc.text(noteLines, margin + 4, y + 4.5);
      y += boxH + 4;
    }
  }

  const drawSectionHeader = (title: string) => {
    if (!ensureSpace(24)) return;
    doc.setFillColor(...ACCENT);
    doc.rect(margin, y, 2, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(sanitizePdfText(title), margin + 4.5, y + 4);
    doc.setDrawColor(...BORDER);
    doc.line(margin, y + 6.5, pageWidth - margin, y + 6.5);
    y += 9.5;
  };

  const drawField = (
    label: string,
    value: string,
    fallback: string = t.notProvided,
    preserveValueWhenBlank = false
  ) => {
    const cleanLabel = sanitizePdfText(label);
    const cleanValue =
      isBlank && !preserveValueWhenBlank
        ? '________________________________________________________'
        : sanitizePdfText(value) || sanitizePdfText(fallback);

    const valLines = doc.splitTextToSize(cleanValue, contentWidth - 6);
    const boxHeight = Math.max(6.8, valLines.length * 4.1 + 3);
    if (!ensureSpace(4 + boxHeight + 2.5)) return;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(...MUTED);
    doc.text(cleanLabel, margin, y);
    y += 3.2;

    doc.setFillColor(...SOFT_BG);
    doc.setDrawColor(...BORDER);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1.2, 1.2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(...(value || isBlank ? INK : MUTED));
    doc.text(valLines, margin + 3, y + 4.2);

    y += boxHeight + 2.8;
  };

  const drawInlinePair = (
    leftLabel: string,
    leftVal: string,
    rightLabel: string,
    rightVal: string
  ) => {
    const halfW = (contentWidth - 4) / 2;
    const lText = isBlank ? '_______________________' : sanitizePdfText(leftVal) || sanitizePdfText(t.notProvided);
    const rText = isBlank ? '_______________________' : sanitizePdfText(rightVal) || sanitizePdfText(t.notProvided);
    const lLines = doc.splitTextToSize(lText, halfW - 6);
    const rLines = doc.splitTextToSize(rText, halfW - 6);
    const boxH = Math.max(6.8, Math.max(lLines.length, rLines.length) * 4.1 + 3);

    if (!ensureSpace(4 + boxH + 2.5)) return;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(...MUTED);
    doc.text(sanitizePdfText(leftLabel), margin, y);
    doc.text(sanitizePdfText(rightLabel), margin + halfW + 4, y);
    y += 3.2;

    doc.setFillColor(...SOFT_BG);
    doc.setDrawColor(...BORDER);
    doc.roundedRect(margin, y, halfW, boxH, 1.2, 1.2, 'FD');
    doc.roundedRect(margin + halfW + 4, y, halfW, boxH, 1.2, 1.2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(...(leftVal || isBlank ? INK : MUTED));
    doc.text(lLines, margin + 3, y + 4.2);
    doc.setTextColor(...(rightVal || isBlank ? INK : MUTED));
    doc.text(rLines, margin + halfW + 7, y + 4.2);

    y += boxH + 2.8;
  };

  const drawChoiceSummary = (label: string, allItems: string[], selectedItems: string[]) => {
    const summaryText = isBlank
      ? allItems.map((i) => `[ ] ${i}`).join('   |   ')
      : selectedItems.length > 0
      ? selectedItems.map((i) => `[x] ${i}`).join('   |   ')
      : t.notSpecified;

    drawField(label, summaryText, t.notSpecified, true);
  };

  const renderCustomFields = (stepId: StepId) => {
    const fields = schema.customFields.filter((f) => f.enabled && f.stepId === stepId);
    for (const field of fields) {
      const val = data.customAnswers[field.id];
      const textVal = Array.isArray(val) ? val.join(', ') : val || '';
      drawField(field.label, textVal);
    }
  };

  const getStepTitle = (id: StepId, fallback: string) => {
    const st = schema.steps.find((s) => s.id === id);
    return st ? getLocalizedStep(st, lang).title : fallback;
  };

  // 1. General
  drawSectionHeader(`1. ${getStepTitle('general', t.sec1)}`);
  drawInlinePair(t.fullName, data.fullName, t.brandName, data.brandName);
  drawInlinePair(t.whatsapp, data.whatsapp, t.email, data.email);

  const enabledServices = schema.services
    .filter((s) => s.enabled)
    .map((s) => getLocalizedService(s, lang).title);
  const selectedServiceLabels = resolveSelectedServiceLabels(schema, data.selectedServices, lang);
  drawChoiceSummary(t.servicesWanted, enabledServices, selectedServiceLabels);
  if (data.customNeedNote.trim() || isBlank) {
    drawField(t.otherNeed, data.customNeedNote, '—');
  }
  renderCustomFields('general');

  // 2. Project
  if (isStepEnabled(schema, 'project')) {
    drawSectionHeader(`2. ${getStepTitle('project', t.sec2)}`);
    drawField(t.sumActivity, data.projectDescription);
    drawField(t.sumTarget, data.targetAudience);
    drawField(t.sumExactText, data.exactTextToInclude);
    renderCustomFields('project');
  }

  // 3. Creative
  if (isStepEnabled(schema, 'creative')) {
    drawSectionHeader(`3. ${getStepTitle('creative', t.sec3)}`);
    const enabledStyles = schema.styles
      .filter((s) => s.enabled)
      .map((s) => getLocalizedStyle(s, lang).title);
    const selectedStyleLabels = resolveSelectedStyleLabels(schema, data.selectedStyles, lang);
    drawChoiceSummary(t.visualStyle, enabledStyles, selectedStyleLabels);
    const existingLogoText = resolveSingleOptionLabel(
      schema.existingLogoOptions,
      data.hasExistingLogo,
      lang,
      DEFAULT_BRIEF_SCHEMA.existingLogoOptions
    );
    drawInlinePair(t.sumColors, data.colorPreferences, t.sumExistingLogo, existingLogoText);
    renderCustomFields('creative');
  }

  // 4. Print
  if (isStepEnabled(schema, 'print')) {
    drawSectionHeader(`4. ${getStepTitle('print', t.sec4)}`);
    const enabledSupports = schema.printSupports
      .filter((o) => o.enabled)
      .map((o) => getLocalizedOptionLabel(o, DEFAULT_BRIEF_SCHEMA.printSupports, lang));
    const selectedSupports = resolveOptionLabels(
      schema.printSupports,
      data.printSupports,
      lang,
      DEFAULT_BRIEF_SCHEMA.printSupports
    );
    drawChoiceSummary(t.sumSupports, enabledSupports, selectedSupports);

    const printerLabel = resolveSingleOptionLabel(
      schema.printerSituations,
      data.printerSituation,
      lang,
      DEFAULT_BRIEF_SCHEMA.printerSituations
    );
    drawInlinePair(t.sumDimensions, data.printDimensions, t.sumPrinter, printerLabel);

    const enabledFinishes = schema.printFinishes
      .filter((o) => o.enabled)
      .map((o) => getLocalizedOptionLabel(o, DEFAULT_BRIEF_SCHEMA.printFinishes, lang));
    const selectedFinishes = resolveOptionLabels(
      schema.printFinishes,
      data.printFinishes,
      lang,
      DEFAULT_BRIEF_SCHEMA.printFinishes
    );
    drawChoiceSummary(t.sumFinishes, enabledFinishes, selectedFinishes);
    renderCustomFields('print');
  }

  // 5. Inspiration
  if (isStepEnabled(schema, 'inspiration')) {
    drawSectionHeader(`5. ${getStepTitle('inspiration', t.sec5)}`);
    drawInlinePair(
      t.sumInspirations,
      data.inspirationNotes,
      t.sumDeadline,
      data.deadline || t.flexible
    );

    if (!isBlank && data.uploadedFiles.length > 0) {
      const fileDesc = data.uploadedFiles
        .map((f) => `${f.name} (${formatFileSize(f.size, lang)})`)
        .join(' | ');
      drawField(`${t.attachedFiles} (${data.uploadedFiles.length})`, fileDesc);

      const imageFiles = data.uploadedFiles.filter(
        (f) => f.previewDataUrl && f.previewDataUrl.startsWith('data:image/')
      );
      if (imageFiles.length > 0 && ensureSpace(32)) {
        let xOffset = margin;
        const thumbW = 34;
        const thumbH = 24;
        for (const imgFile of imageFiles.slice(0, 5)) {
          if (xOffset + thumbW > pageWidth - margin) break;
          try {
            const isPng = imgFile.previewDataUrl!.includes('image/png');
            doc.setDrawColor(...BORDER);
            doc.roundedRect(xOffset, y, thumbW, thumbH, 1.2, 1.2, 'S');
            doc.addImage(
              imgFile.previewDataUrl!,
              isPng ? 'PNG' : 'JPEG',
              xOffset + 0.8,
              y + 0.8,
              thumbW - 1.6,
              thumbH - 1.6,
              undefined,
              'FAST'
            );
            xOffset += thumbW + 3;
          } catch {
            // Skip invalid image
          }
        }
        y += thumbH + 5;
      }
    }
    renderCustomFields('inspiration');
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BORDER);
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(...MUTED);
    doc.text(
      sanitizePdfText(
        `${schema.agency.agencyName} - ${schema.agency.whatsappDisplay} - ${schema.agency.instagram}`
      ),
      margin,
      pageHeight - 6.5
    );
    doc.text(`Page ${i} / ${totalPages}`, pageWidth - margin, pageHeight - 6.5, {
      align: 'right',
    });
  }

  const safeBrand = sanitizePdfText(data.brandName || data.fullName || 'Client')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);

  const fileName = isBlank
    ? `Brief_Template_${sanitizePdfText(schema.agency.agencyName).replace(/\s+/g, '_')}.pdf`
    : `Brief_LogoDesign_${safeBrand || 'Project'}_${data.referenceCode}.pdf`;

  doc.save(fileName);
}
