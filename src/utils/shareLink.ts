import LZString from 'lz-string';
import { BriefFormData, BriefSchema, Language } from '../types/brief';
import { DEFAULT_BRIEF_SCHEMA } from '../data/defaultSchema';

export interface SharedPayload {
  schema: BriefSchema;
  prefill?: Partial<BriefFormData>;
  clientMode?: boolean;
  lang?: Language;
}

const HASH_PREFIX = '#brief=';

export function encodeShareLink(
  schema: BriefSchema,
  prefill?: Partial<BriefFormData>,
  clientMode = true,
  lang?: Language
): string {
  const payload: SharedPayload = {
    schema,
    clientMode,
    ...(lang ? { lang } : {}),
  };

  if (prefill) {
    const { uploadedFiles, ...lightPrefill } = prefill;
    const cleaned = Object.fromEntries(
      Object.entries(lightPrefill).filter(([, v]) => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'object' && v !== null) return Object.keys(v).length > 0;
        return Boolean(v);
      })
    );
    if (Object.keys(cleaned).length > 0) {
      payload.prefill = cleaned;
    }
  }

  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload));
  const cleanPath =
    window.location.pathname === '/' ? '/logo-design-formulaire' : window.location.pathname;
  const baseUrl = `${window.location.origin}${cleanPath}`;
  return `${baseUrl}${HASH_PREFIX}${compressed}`;
}

export function decodeShareLinkFromLocation(): SharedPayload | null {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith(HASH_PREFIX)) {
      return null;
    }
    const encoded = hash.slice(HASH_PREFIX.length);
    if (!encoded) return null;
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
    if (!decompressed) return null;
    const parsed = JSON.parse(decompressed) as SharedPayload;
    if (!parsed || !parsed.schema) return null;

    return {
      schema: {
        ...DEFAULT_BRIEF_SCHEMA,
        ...parsed.schema,
        agency: {
          ...DEFAULT_BRIEF_SCHEMA.agency,
          ...(parsed.schema.agency || {}),
        },
        steps: parsed.schema.steps?.length ? parsed.schema.steps : DEFAULT_BRIEF_SCHEMA.steps,
        services: parsed.schema.services?.length
          ? parsed.schema.services
          : DEFAULT_BRIEF_SCHEMA.services,
        styles: parsed.schema.styles?.length ? parsed.schema.styles : DEFAULT_BRIEF_SCHEMA.styles,
        existingLogoOptions: parsed.schema.existingLogoOptions?.length
          ? parsed.schema.existingLogoOptions
          : DEFAULT_BRIEF_SCHEMA.existingLogoOptions,
        printSupports: parsed.schema.printSupports?.length
          ? parsed.schema.printSupports
          : DEFAULT_BRIEF_SCHEMA.printSupports,
        printerSituations: parsed.schema.printerSituations?.length
          ? parsed.schema.printerSituations
          : DEFAULT_BRIEF_SCHEMA.printerSituations,
        printFinishes: parsed.schema.printFinishes?.length
          ? parsed.schema.printFinishes
          : DEFAULT_BRIEF_SCHEMA.printFinishes,
        customFields: parsed.schema.customFields || [],
      },
      prefill: parsed.prefill,
      clientMode: parsed.clientMode ?? true,
      lang: parsed.lang,
    };
  } catch {
    return null;
  }
}
