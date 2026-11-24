import {
  AgencyConfig,
  Language,
  ServiceOption,
  SimpleOption,
  StepConfig,
  StepId,
  StyleOption,
} from '../types/brief';
import { DEFAULT_BRIEF_SCHEMA } from './defaultSchema';

const EN_STEP_TRANSLATIONS: Record<
  StepId,
  { shortTitle: string; title: string; subtitle: string; note?: string }
> = {
  general: {
    shortTitle: 'General Info',
    title: 'General Information',
    subtitle: 'Your contact details and the services required for your project.',
  },
  project: {
    shortTitle: 'Project & Target',
    title: 'Your Project & Target Audience',
    subtitle: 'Help us understand your business, market, and message.',
  },
  creative: {
    shortTitle: 'Creative Style',
    title: 'Creative Direction & Style',
    subtitle: 'Define the visual look and feel of your future brand.',
  },
  print: {
    shortTitle: 'Print Specs',
    title: 'Print Specifications',
    subtitle: 'Technical details for your physical print and packaging items.',
    note: 'Fill in this section if your project includes physical media or printing.',
  },
  inspiration: {
    shortTitle: 'Inspiration & Timeline',
    title: 'Inspiration & Deadlines',
    subtitle: 'Your visual references, existing files, and target deadline.',
  },
};

const EN_SERVICE_CATEGORIES: Record<string, string> = {
  '1. IDENTITÉ VISUELLE & BRANDING': '1. VISUAL IDENTITY & BRANDING',
  '2. PACKAGING & ÉTIQUETTES': '2. PACKAGING & LABELS',
  '3. CONCEPTION 3D & RENDU': '3. 3D DESIGN & RENDERING',
  '4. SUPPORTS DE COMMUNICATION & DIGITAL': '4. COMMUNICATION & DIGITAL ASSETS',
  '5. SIGNALÉTIQUE & HABILLAGE': '5. SIGNAGE & BRANDING WRAPS',
  '6. EXÉCUTION, IMPRESSION & LIVRAISON': '6. PRODUCTION, PRINTING & DELIVERY',
};

const EN_SERVICES: Record<string, { title: string; subtitle: string }> = {
  'id-logo': { title: 'Logo Design', subtitle: '' },
  'id-charte': { title: 'Brand Guidelines / Visual Identity Charter', subtitle: '' },
  'id-rebranding': { title: 'Rebranding (Identity Redesign)', subtitle: '' },
  'id-naming': { title: 'Naming (Brand Name Research)', subtitle: '' },
  'pack-boite': { title: 'Packaging / Product Box Design', subtitle: '' },
  'pack-etiquette': { title: 'Label / Sticker Design', subtitle: '' },
  'pack-mockup': { title: '3D Product Mockup', subtitle: '' },
  '3d-model': { title: '3D Modeling (Object / Product / Furniture)', subtitle: '' },
  '3d-arch': { title: '3D Interior / Exterior Rendering (Architecture)', subtitle: '' },
  '3d-stand': { title: 'Exhibition Booth / 3D Kiosk', subtitle: '' },
  '3d-anim': { title: '3D Animation / Product Video', subtitle: '' },
  'com-carte': { title: 'Business Card / Stationery', subtitle: '' },
  'com-flyer': { title: 'Flyer / Brochure / Catalog / Menu', subtitle: '' },
  'com-social': { title: 'Social Media Visuals (Posts / Stories / Templates)', subtitle: '' },
  'com-web': { title: 'Web Banner / Pitch Deck Presentation', subtitle: '' },
  'sig-enseigne': { title: 'Commercial Shop Sign', subtitle: '' },
  'sig-vitrine': { title: 'Storefront Wrap / Large-Format Decal', subtitle: '' },
  'sig-plv': { title: 'Billboard / POS Display / Roll-up', subtitle: '' },
  'sig-canvas': { title: 'Decorative Wall Art / Custom Canvas', subtitle: '' },
  'exec-design': { title: 'Design Only (Print-ready source files)', subtitle: '' },
  'exec-print': { title: 'Design + Printing', subtitle: '' },
  'exec-delivery': { title: 'Design + Printing + Home / On-site Delivery', subtitle: '' },
  'exec-install': {
    title: 'Fabrication & On-site Installation (Signs / Storefronts / Booths)',
    subtitle: '',
  },
};

const EN_STYLES: Record<string, string> = {
  'moderne-minimaliste': 'Modern & Minimalist',
  'luxe-haut-de-gamme': 'Luxury & High-End',
  'chaleureux-artisanal': 'Warm & Artisanal',
  'dynamique-audacieux': 'Dynamic & Bold',
  'serieux-professionnel': 'Serious & Professional',
  'conseil-agence': 'Let Logo Design Advise',
};

const EN_SIMPLE_OPTIONS: Record<string, string> = {
  'yes-files': 'Yes, I will send you the files',
  'no-scratch': 'No, creating from scratch',
  cards: 'Business cards / Stationery',
  flyers: 'Flyers / Brochures / Menus',
  labels: 'Adhesive labels / Bottles',
  boxes: 'Boxes / Cardboard packaging',
  banners: 'Banners / Roll-ups / Signage',
  textile: 'Apparel (T-shirts, tote bags...)',
  'none-digital': 'None (100% Digital)',
  'has-printer-template': 'I already have a printer and their dieline / technical template',
  'has-printer-no-template': 'I have a printer, but no template yet',
  'no-printer': "I don't have a printer yet",
  standard: 'Standard (Matte or Gloss)',
  foil: 'Hot Foil Stamping (Gold / Silver)',
  'spot-uv': 'Spot UV Varnish',
  textured: 'Textured / Kraft / Transparent paper',
  advice: 'Need advice from Logo Design',
};

export function getLocalizedAgency(agency: AgencyConfig, lang: Language): AgencyConfig {
  if (lang === 'fr') return agency;
  const def = DEFAULT_BRIEF_SCHEMA.agency;
  return {
    ...agency,
    heroTitle: agency.heroTitle === def.heroTitle ? 'Welcome to Logo Design' : agency.heroTitle,
    heroSubtitle:
      agency.heroSubtitle === def.heroSubtitle
        ? 'Take 3 minutes to describe your project. Your answers will help us craft a bespoke design tailored for both digital and print.'
        : agency.heroSubtitle,
  };
}

export function getLocalizedStep(step: StepConfig, lang: Language): StepConfig {
  if (lang === 'fr') return step;
  const def = DEFAULT_BRIEF_SCHEMA.steps.find((s) => s.id === step.id);
  const tr = EN_STEP_TRANSLATIONS[step.id];
  if (!tr) return step;
  return {
    ...step,
    shortTitle: !def || step.shortTitle === def.shortTitle ? tr.shortTitle : step.shortTitle,
    title: !def || step.title === def.title ? tr.title : step.title,
    subtitle: !def || step.subtitle === def.subtitle ? tr.subtitle : step.subtitle,
    note: tr.note && (!def || step.note === def.note) ? tr.note : step.note,
  };
}

export function getLocalizedServiceCategory(tag: string, lang: Language): string {
  if (!tag) return '';
  if (lang === 'fr') return tag;
  return EN_SERVICE_CATEGORIES[tag] || tag;
}

export function getLocalizedService(service: ServiceOption, lang: Language): ServiceOption {
  if (lang === 'fr') return service;
  const def = DEFAULT_BRIEF_SCHEMA.services.find((s) => s.id === service.id);
  const tr = EN_SERVICES[service.id];
  const translatedTag = getLocalizedServiceCategory(service.tag, lang);
  if (!tr) return { ...service, tag: translatedTag };
  return {
    ...service,
    title: !def || service.title === def.title ? tr.title : service.title,
    subtitle: !def || service.subtitle === def.subtitle ? tr.subtitle : service.subtitle,
    tag: translatedTag,
  };
}

export function getLocalizedStyle(style: StyleOption, lang: Language): StyleOption {
  if (lang === 'fr') return style;
  const def = DEFAULT_BRIEF_SCHEMA.styles.find((s) => s.id === style.id);
  const tr = EN_STYLES[style.id];
  if (!tr) return style;
  return {
    ...style,
    title: !def || style.title === def.title ? tr : style.title,
  };
}

export function getLocalizedOptionLabel(
  opt: SimpleOption,
  defaults: SimpleOption[],
  lang: Language
): string {
  if (lang === 'fr') return opt.label;
  const def = defaults.find((d) => d.id === opt.id);
  const tr = EN_SIMPLE_OPTIONS[opt.id];
  if (tr && (!def || opt.label === def.label)) return tr;
  return opt.label;
}

export const UI_TEXT = {
  fr: {
    editShort: 'Modifier',
    editAndNeeds: 'Modifier & Besoins',
    viewForm: 'Voir le formulaire',
    share: 'Partager',
    pdf: 'PDF',
    dark: 'Sombre',
    light: 'Clair',
    requiredMark: '* Obligatoire',
    pageLabel: 'Page',
    ofLabel: 'sur',
    page1Short: 'Projet & Besoins',
    page1Title: 'Informations Générales & Projet',
    page2Short: 'Style, Print & Délais',
    page2Title: 'Direction Créative, Impression & Délais',
    validationBanner: 'Veuillez compléter les champs obligatoires signalés ci-dessous.',
    prevBtn: 'Précédent',
    nextBtn: 'Suivant',
    backToSummary: 'Retour au récapitulatif',
    submitPrefix: 'Envoyer mon brief à',
    fullName: 'Nom complet',
    brandName: "Nom de l'entreprise ou de la marque",
    whatsapp: 'Numéro WhatsApp',
    whatsappPlaceholder: 'Ex : +212 6 12 34 56 78',
    email: 'Adresse E-mail',
    emailPlaceholder: 'Ex : contact@votremarque.com',
    optional: '(optionnel)',
    yourAnswer: 'Votre réponse',
    servicesWanted: 'Sélectionnez les services souhaités',
    multiChoice: '(choix multiples)',
    modifyNeeds: 'Modifier les besoins',
    otherNeed: 'Autre besoin ou précision',
    otherNeedPlaceholder: 'Précisez si vous avez un besoin spécifique',
    projectDesc: 'Présentez votre activité ou votre produit en quelques phrases',
    projectDescPlaceholder: 'Décrivez votre activité, vos produits/services et vos valeurs...',
    targetAudience: 'Qui sont vos clients idéaux / votre cible ?',
    targetAudiencePlaceholder:
      'Ex : Particuliers, entreprises, jeunes actifs, clientèle haut de gamme...',
    exactText: 'Texte exact à intégrer dans le design',
    exactTextHelper: 'Nom, slogan, coordonnées, mentions obligatoires, ingrédients...',
    exactTextPlaceholder: 'Écrivez exactement les textes à faire apparaître dans le design...',
    visualStyle: 'Style visuel recherché',
    colorPref: 'Préférences de couleurs ou couleurs à éviter',
    colorPrefPlaceholder: 'Ex : Tons sobres noir/doré ; éviter les couleurs trop vives...',
    existingLogo: 'Avez-vous déjà un logo ou une charte graphique ?',
    printSupports: 'Supports physiques concernés',
    dimensions: 'Dimensions exactes du support',
    dimensionsPlaceholder:
      'Ex: Carte 8.5 x 5.5 cm, Flyer A5, Étiquette 10 x 6 cm, ou Je ne sais pas encore',
    printerSituation: "Situation avec l'imprimeur",
    finishes: 'Finitions spéciales souhaitées',
    inspirationLinks:
      "Partagez des liens d'inspiration ou décrivez des exemples que vous aimez",
    inspirationPlaceholder: 'Collez des liens ou décrivez ce qui vous inspire...',
    uploadTitle: 'Importer des fichiers',
    uploadHelper: "(logos existants, croquis, gabarits ou photos d'inspiration)",
    dragText: 'Glissez vos fichiers ici ou',
    browseFiles: 'parcourir vos dossiers',
    remove: 'Supprimer',
    deadline: 'Date limite souhaitée / Deadline',
    dateMode: 'Date',
    textMode: 'Texte libre',
    deadlinePlaceholder: 'Ex : Sous 1 à 2 semaines, Urgent, Flexible...',
    errFullName: 'Veuillez renseigner votre nom complet.',
    errBrandName: "Veuillez indiquer le nom de l'entreprise ou de la marque.",
    errWhatsappRequired: 'Veuillez indiquer votre numéro WhatsApp.',
    errWhatsappInvalid: 'Veuillez saisir un numéro WhatsApp valide (min. 8 chiffres).',
    errEmailInvalid: 'Adresse e-mail invalide.',
    errRequiredField: 'Ce champ est obligatoire.',
    refLabel: 'Référence',
    readyTitle: 'Votre brief créatif est prêt !',
    readyThanks1: 'Merci',
    readyThanks2: 'pour',
    readyThanks3: 'Envoyez votre brief sur WhatsApp ou téléchargez le PDF.',
    sendWhatsapp: 'Envoyer sur WhatsApp',
    downloadPdf: 'Télécharger le brief PDF',
    generatingPdf: 'Génération...',
    copySummary: 'Copier le récapitulatif',
    copied: 'Copié !',
    waRecipient: 'WhatsApp destinataire',
    filesPdfTip:
      'Vos aperçus images sont inclus dans le fichier PDF. Pensez à le joindre dans votre conversation WhatsApp si nécessaire.',
    summaryTitle: 'Récapitulatif des réponses',
    newBrief: 'Nouveau brief',
    editBtn: 'Modifier',
    notProvided: 'Non renseigné',
    notSpecified: 'Non précisé',
    noService: 'Aucun service sélectionné',
    flexible: 'Flexible / À définir',
    attachedFiles: 'Fichiers joints',
    sec1: '1. Informations Générales',
    sec2: '2. Votre Projet & Votre Cible',
    sec3: '3. Direction Créative & Style',
    sec4: '4. Spécifications Impression',
    sec5: '5. Inspirations & Délais',
    sumActivity: 'Activité ou produit',
    sumTarget: 'Clients idéaux / Cible',
    sumExactText: 'Texte exact à intégrer',
    sumColors: 'Couleurs / Préférences',
    sumExistingLogo: 'Logo ou charte existant(e)',
    sumSupports: 'Supports physiques',
    sumDimensions: 'Dimensions exactes',
    sumPrinter: 'Imprimeur & gabarit',
    sumFinishes: 'Finitions spéciales',
    sumInspirations: 'Liens & inspirations',
    sumDeadline: 'Délai souhaité / Deadline',
    shareTitle: 'Partager ce brief au client',
    shareSubtitle: 'Vos besoins modifiés et questions sont inclus dans ce lien.',
    close: 'Fermer',
    greetingLabel: "Note d'accueil pour ce client (optionnel)",
    greetingPlaceholder: 'Ex : Bonjour Nadia, merci de compléter ce brief.',
    includePrefill: 'Inclure les besoins ou champs déjà pré-remplis',
    clientLinkLabel: 'Lien client',
    copyBtn: 'Copier',
    localhostNote:
      'Aperçu local (localhost) : hébergez le dossier dist en ligne pour envoyer ce lien sur téléphone.',
    sendViaWhatsapp: 'Envoyer par WhatsApp',
    exportSheetPdf: 'Exporter Fiche PDF',
    unlockAgency: 'Mode Agence : modifier ce formulaire',
    toastNewBrief: 'Nouveau brief prêt.',
    toastReset: 'Formulaire réinitialisé.',
    toastPdfTemplate: 'Fiche modèle PDF téléchargée.',
    toastPdfReady: 'Brief PDF téléchargé.',
    toastPresetSaved: 'Modèle enregistré.',
  },
  en: {
    editShort: 'Edit',
    editAndNeeds: 'Edit & Needs',
    viewForm: 'View Form',
    share: 'Share',
    pdf: 'PDF',
    dark: 'Dark',
    light: 'Light',
    requiredMark: '* Required',
    pageLabel: 'Page',
    ofLabel: 'of',
    page1Short: 'Project & Needs',
    page1Title: 'General Information & Project',
    page2Short: 'Style, Print & Timeline',
    page2Title: 'Creative Direction, Print & Deadlines',
    validationBanner: 'Please complete the required fields highlighted below.',
    prevBtn: 'Previous',
    nextBtn: 'Next',
    backToSummary: 'Back to summary',
    submitPrefix: 'Send my brief to',
    fullName: 'Full Name',
    brandName: 'Company or Brand Name',
    whatsapp: 'WhatsApp Number',
    whatsappPlaceholder: 'e.g. +212 6 12 34 56 78',
    email: 'Email Address',
    emailPlaceholder: 'e.g. contact@yourbrand.com',
    optional: '(optional)',
    yourAnswer: 'Your answer',
    servicesWanted: 'Select desired services',
    multiChoice: '(multiple choice)',
    modifyNeeds: 'Edit services',
    otherNeed: 'Other need or details',
    otherNeedPlaceholder: 'Specify if you have any particular requirement',
    projectDesc: 'Describe your business or product in a few sentences',
    projectDescPlaceholder: 'Tell us about your business, products/services, and core values...',
    targetAudience: 'Who are your ideal customers / target audience?',
    targetAudiencePlaceholder:
      'e.g. Consumers, B2B companies, young professionals, luxury buyers...',
    exactText: 'Exact text to include in the design',
    exactTextHelper: 'Brand name, tagline, contact details, legal notices, ingredients...',
    exactTextPlaceholder: 'Write the exact wording that must appear in the design...',
    visualStyle: 'Desired Visual Style',
    colorPref: 'Color preferences or colors to avoid',
    colorPrefPlaceholder: 'e.g. Clean black & gold tones; avoid bright neon colors...',
    existingLogo: 'Do you already have a logo or brand guidelines?',
    printSupports: 'Physical print items involved',
    dimensions: 'Exact dimensions of the print piece',
    dimensionsPlaceholder:
      'e.g. Card 8.5 x 5.5 cm, Flyer A5, Label 10 x 6 cm, or Not sure yet',
    printerSituation: 'Situation with your print shop',
    finishes: 'Special finishes desired',
    inspirationLinks: 'Share inspiration links or describe examples you like',
    inspirationPlaceholder: 'Paste links or describe visual styles you like...',
    uploadTitle: 'Upload files',
    uploadHelper: '(existing logos, sketches, dielines, or inspiration images)',
    dragText: 'Drag & drop your files here or',
    browseFiles: 'browse files',
    remove: 'Remove',
    deadline: 'Target Deadline',
    dateMode: 'Date',
    textMode: 'Free text',
    deadlinePlaceholder: 'e.g. Within 1 to 2 weeks, Urgent, Flexible...',
    errFullName: 'Please enter your full name.',
    errBrandName: 'Please enter your company or brand name.',
    errWhatsappRequired: 'Please enter your WhatsApp number.',
    errWhatsappInvalid: 'Please enter a valid WhatsApp number (min. 8 digits).',
    errEmailInvalid: 'Invalid email address.',
    errRequiredField: 'This field is required.',
    refLabel: 'Reference',
    readyTitle: 'Your creative brief is ready!',
    readyThanks1: 'Thank you',
    readyThanks2: 'for',
    readyThanks3: 'Send your brief via WhatsApp or download the PDF file.',
    sendWhatsapp: 'Send via WhatsApp',
    downloadPdf: 'Download Brief PDF',
    generatingPdf: 'Generating...',
    copySummary: 'Copy summary',
    copied: 'Copied!',
    waRecipient: 'Recipient WhatsApp',
    filesPdfTip:
      'Your image previews are embedded inside the PDF. Remember to attach the PDF in your WhatsApp chat if needed.',
    summaryTitle: 'Summary of your answers',
    newBrief: 'New brief',
    editBtn: 'Edit',
    notProvided: 'Not provided',
    notSpecified: 'Not specified',
    noService: 'No service selected',
    flexible: 'Flexible / TBD',
    attachedFiles: 'Attached files',
    sec1: '1. General Information',
    sec2: '2. Project & Target Audience',
    sec3: '3. Creative Direction & Style',
    sec4: '4. Print Specifications',
    sec5: '5. Inspiration & Deadlines',
    sumActivity: 'Business or product',
    sumTarget: 'Ideal customers / Target',
    sumExactText: 'Exact text to include',
    sumColors: 'Colors / Preferences',
    sumExistingLogo: 'Existing logo or guidelines',
    sumSupports: 'Physical print items',
    sumDimensions: 'Exact dimensions',
    sumPrinter: 'Printer & template',
    sumFinishes: 'Special finishes',
    sumInspirations: 'Links & inspiration',
    sumDeadline: 'Target deadline',
    shareTitle: 'Share this brief with your client',
    shareSubtitle: 'Your edited services and questions are included in this link.',
    close: 'Close',
    greetingLabel: 'Custom welcome note for this client (optional)',
    greetingPlaceholder: 'e.g. Hi Nadia, please complete this creative brief.',
    includePrefill: 'Include pre-filled services or fields',
    clientLinkLabel: 'Client link',
    copyBtn: 'Copy',
    localhostNote:
      'Local preview (localhost): deploy the dist folder online to share this link with clients on mobile.',
    sendViaWhatsapp: 'Send via WhatsApp',
    exportSheetPdf: 'Export Blank PDF',
    unlockAgency: 'Agency Mode: edit this form',
    toastNewBrief: 'New brief ready.',
    toastReset: 'Form reset to defaults.',
    toastPdfTemplate: 'Template PDF downloaded.',
    toastPdfReady: 'Brief PDF downloaded.',
    toastPresetSaved: 'Template saved.',
  },
} as const;
