export type Language = 'fr' | 'en';

export type StepId = 'general' | 'project' | 'creative' | 'print' | 'inspiration';

export type AccentColor = 'blue' | 'emerald' | 'violet' | 'amber' | 'gold' | 'slate';

export type IconKey =
  | 'pen-tool'
  | 'palette'
  | 'package'
  | 'printer'
  | 'signpost'
  | 'share-2'
  | 'globe'
  | 'box'
  | 'wand-2'
  | 'layers'
  | 'sparkles'
  | 'award'
  | 'compass'
  | 'briefcase'
  | 'zap'
  | 'brush'
  | 'smartphone'
  | 'check-circle';

export interface AgencyConfig {
  agencyName: string;
  topBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroMotto: string;
  clientGreetingNote: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  instagram: string;
  facebook: string;
  pinterest: string;
  footerBannerText: string;
}

export interface ServiceOption {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: IconKey;
  accent: AccentColor;
  enabled: boolean;
  preselected?: boolean;
}

export interface StyleOption {
  id: string;
  title: string;
  description: string;
  icon: IconKey;
  accent: AccentColor;
  enabled: boolean;
}

export interface SimpleOption {
  id: string;
  label: string;
  enabled: boolean;
}

export interface StepConfig {
  id: StepId;
  shortTitle: string;
  title: string;
  subtitle: string;
  note?: string;
  enabled: boolean;
}

export interface CustomField {
  id: string;
  stepId: StepId;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox-group';
  placeholder?: string;
  options?: string[];
  required: boolean;
  enabled: boolean;
}

export interface BriefSchema {
  version: number;
  agency: AgencyConfig;
  steps: StepConfig[];
  services: ServiceOption[];
  styles: StyleOption[];
  existingLogoOptions: SimpleOption[];
  printSupports: SimpleOption[];
  printerSituations: SimpleOption[];
  printFinishes: SimpleOption[];
  customFields: CustomField[];
  showStudioHighlights: boolean;
}

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  previewDataUrl?: string;
}

export interface BriefFormData {
  // Meta
  referenceCode: string;
  // Step 1
  fullName: string;
  brandName: string;
  whatsapp: string;
  email: string;
  selectedServices: string[];
  customNeedNote: string;
  // Step 2
  projectDescription: string;
  targetAudience: string;
  exactTextToInclude: string;
  // Step 3
  selectedStyles: string[];
  colorPreferences: string;
  hasExistingLogo: string;
  // Step 4
  printSupports: string[];
  printDimensions: string;
  printerSituation: string;
  printFinishes: string[];
  // Step 5
  inspirationNotes: string;
  uploadedFiles: UploadedFileItem[];
  deadline: string;
  deadlineMode: 'date' | 'text';
  // Dynamic custom fields
  customAnswers: Record<string, string | string[]>;
}

export interface SavedPreset {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  schema: BriefSchema;
}
