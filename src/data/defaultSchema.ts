import { BriefFormData, BriefSchema, SavedPreset } from '../types/brief';

export const SERVICE_CATEGORIES = [
  '1. IDENTITÉ VISUELLE & BRANDING',
  '2. PACKAGING & ÉTIQUETTES',
  '3. CONCEPTION 3D & RENDU',
  '4. SUPPORTS DE COMMUNICATION & DIGITAL',
  '5. SIGNALÉTIQUE & HABILLAGE',
  '6. EXÉCUTION, IMPRESSION & LIVRAISON',
] as const;

export const DEFAULT_BRIEF_SCHEMA: BriefSchema = {
  version: 2,
  showStudioHighlights: true,
  agency: {
    agencyName: 'Logo Design',
    topBadge: '',
    heroTitle: 'Bienvenue chez Logo Design',
    heroSubtitle:
      "Prenez 3 minutes pour nous décrire votre projet. Vos réponses nous aideront à concevoir un design sur mesure, adapté au digital comme à l'impression.",
    heroMotto: '',
    clientGreetingNote: '',
    whatsappNumber: '212771663435',
    whatsappDisplay: '+212 771 66 34 35',
    email: 'yazizi295@gmail.com',
    instagram: '@logo_art1',
    facebook: '@Logo Design',
    pinterest: '@logo_art1',
    footerBannerText: '',
  },
  steps: [
    {
      id: 'general',
      shortTitle: 'Informations',
      title: 'Informations Générales',
      subtitle: 'Vos coordonnées et les prestations souhaitées pour votre projet.',
      enabled: true,
    },
    {
      id: 'project',
      shortTitle: 'Projet & Cible',
      title: 'Votre Projet & Votre Cible',
      subtitle: 'Aidez-nous à comprendre votre activité, votre marché et votre message.',
      enabled: true,
    },
    {
      id: 'creative',
      shortTitle: 'Style & Couleurs',
      title: 'Direction Créative & Style',
      subtitle: "Définissez l'univers esthétique et émotionnel de votre future marque.",
      enabled: true,
    },
    {
      id: 'print',
      shortTitle: 'Impression',
      title: 'Spécifications Impression',
      subtitle: 'Détails techniques pour vos supports physiques et packaging.',
      note: 'Remplissez cette section si votre projet inclut un support physique ou une impression.',
      enabled: true,
    },
    {
      id: 'inspiration',
      shortTitle: 'Inspirations',
      title: 'Inspirations & Délais',
      subtitle: 'Vos références visuelles, fichiers existants et échéance souhaitée.',
      enabled: true,
    },
  ],
  services: [
    // 1. IDENTITÉ VISUELLE & BRANDING
    {
      id: 'id-logo',
      title: 'Création de Logo',
      subtitle: '',
      tag: '1. IDENTITÉ VISUELLE & BRANDING',
      icon: 'pen-tool',
      accent: 'blue',
      enabled: true,
    },
    {
      id: 'id-charte',
      title: 'Charte graphique / Brand Guidelines',
      subtitle: '',
      tag: '1. IDENTITÉ VISUELLE & BRANDING',
      icon: 'palette',
      accent: 'emerald',
      enabled: true,
    },
    {
      id: 'id-rebranding',
      title: "Rebranding (Refonte d'identité)",
      subtitle: '',
      tag: '1. IDENTITÉ VISUELLE & BRANDING',
      icon: 'sparkles',
      accent: 'blue',
      enabled: true,
    },
    {
      id: 'id-naming',
      title: 'Naming (Recherche de nom de marque)',
      subtitle: '',
      tag: '1. IDENTITÉ VISUELLE & BRANDING',
      icon: 'compass',
      accent: 'emerald',
      enabled: true,
    },

    // 2. PACKAGING & ÉTIQUETTES
    {
      id: 'pack-boite',
      title: 'Design de Packaging / Boîte produit',
      subtitle: '',
      tag: '2. PACKAGING & ÉTIQUETTES',
      icon: 'package',
      accent: 'violet',
      enabled: true,
    },
    {
      id: 'pack-etiquette',
      title: "Design d'Étiquette / Sticker",
      subtitle: '',
      tag: '2. PACKAGING & ÉTIQUETTES',
      icon: 'layers',
      accent: 'violet',
      enabled: true,
    },
    {
      id: 'pack-mockup',
      title: 'Mockup 3D du produit',
      subtitle: '',
      tag: '2. PACKAGING & ÉTIQUETTES',
      icon: 'box',
      accent: 'emerald',
      enabled: true,
    },

    // 3. CONCEPTION 3D & RENDU
    {
      id: '3d-model',
      title: 'Modélisation 3D (Objet / Produit / Mobilier)',
      subtitle: '',
      tag: '3. CONCEPTION 3D & RENDU',
      icon: 'box',
      accent: 'gold',
      enabled: true,
    },
    {
      id: '3d-arch',
      title: 'Rendu 3D Intérieur / Extérieur (Architecture)',
      subtitle: '',
      tag: '3. CONCEPTION 3D & RENDU',
      icon: 'box',
      accent: 'gold',
      enabled: true,
    },
    {
      id: '3d-stand',
      title: "Stand d'exposition / Kiosque 3D",
      subtitle: '',
      tag: '3. CONCEPTION 3D & RENDU',
      icon: 'layers',
      accent: 'amber',
      enabled: true,
    },
    {
      id: '3d-anim',
      title: 'Animation 3D / Vidéo produit',
      subtitle: '',
      tag: '3. CONCEPTION 3D & RENDU',
      icon: 'zap',
      accent: 'amber',
      enabled: true,
    },

    // 4. SUPPORTS DE COMMUNICATION & DIGITAL
    {
      id: 'com-carte',
      title: 'Carte de visite / Papeterie',
      subtitle: '',
      tag: '4. SUPPORTS DE COMMUNICATION & DIGITAL',
      icon: 'printer',
      accent: 'blue',
      enabled: true,
    },
    {
      id: 'com-flyer',
      title: 'Flyer / Dépliant / Catalogue / Menu',
      subtitle: '',
      tag: '4. SUPPORTS DE COMMUNICATION & DIGITAL',
      icon: 'printer',
      accent: 'blue',
      enabled: true,
    },
    {
      id: 'com-social',
      title: 'Visuels Réseaux Sociaux (Posts / Stories / Templates)',
      subtitle: '',
      tag: '4. SUPPORTS DE COMMUNICATION & DIGITAL',
      icon: 'share-2',
      accent: 'violet',
      enabled: true,
    },
    {
      id: 'com-web',
      title: 'Bannière Web / Présentation Pitch Deck',
      subtitle: '',
      tag: '4. SUPPORTS DE COMMUNICATION & DIGITAL',
      icon: 'globe',
      accent: 'emerald',
      enabled: true,
    },

    // 5. SIGNALÉTIQUE & HABILLAGE
    {
      id: 'sig-enseigne',
      title: 'Enseigne commerciale',
      subtitle: '',
      tag: '5. SIGNALÉTIQUE & HABILLAGE',
      icon: 'signpost',
      accent: 'amber',
      enabled: true,
    },
    {
      id: 'sig-vitrine',
      title: 'Habillage vitrine / Autocollant grand format',
      subtitle: '',
      tag: '5. SIGNALÉTIQUE & HABILLAGE',
      icon: 'signpost',
      accent: 'amber',
      enabled: true,
    },
    {
      id: 'sig-plv',
      title: 'Panneau publicitaire / PLV / Roll-up',
      subtitle: '',
      tag: '5. SIGNALÉTIQUE & HABILLAGE',
      icon: 'layers',
      accent: 'blue',
      enabled: true,
    },
    {
      id: 'sig-canvas',
      title: 'Tableau décoratif / Canvas sur mesure',
      subtitle: '',
      tag: '5. SIGNALÉTIQUE & HABILLAGE',
      icon: 'brush',
      accent: 'gold',
      enabled: true,
    },

    // 6. EXÉCUTION, IMPRESSION & LIVRAISON
    {
      id: 'exec-design',
      title: 'Design uniquement (Fichiers sources prêts à imprimer)',
      subtitle: '',
      tag: '6. EXÉCUTION, IMPRESSION & LIVRAISON',
      icon: 'check-circle',
      accent: 'emerald',
      enabled: true,
    },
    {
      id: 'exec-print',
      title: 'Design + Impression',
      subtitle: '',
      tag: '6. EXÉCUTION, IMPRESSION & LIVRAISON',
      icon: 'printer',
      accent: 'blue',
      enabled: true,
    },
    {
      id: 'exec-delivery',
      title: 'Design + Impression + Livraison à domicile / sur place',
      subtitle: '',
      tag: '6. EXÉCUTION, IMPRESSION & LIVRAISON',
      icon: 'package',
      accent: 'emerald',
      enabled: true,
    },
    {
      id: 'exec-install',
      title: 'Fabrication & Pose sur place (Enseignes / Vitrines / Stands)',
      subtitle: '',
      tag: '6. EXÉCUTION, IMPRESSION & LIVRAISON',
      icon: 'award',
      accent: 'slate',
      enabled: true,
    },
  ],
  styles: [
    {
      id: 'moderne-minimaliste',
      title: 'Moderne & Minimaliste',
      description: 'Lignes épurées, géométrie claire, lisibilité maximale.',
      icon: 'sparkles',
      accent: 'blue',
      enabled: true,
    },
    {
      id: 'luxe-haut-de-gamme',
      title: 'Luxe & Haut de gamme',
      description: 'Raffinement, détails nobles, typographie élégante et prestige.',
      icon: 'award',
      accent: 'gold',
      enabled: true,
    },
    {
      id: 'chaleureux-artisanal',
      title: 'Chaleureux & Artisanal',
      description: 'Authentique, humain, textures organiques et proximité.',
      icon: 'brush',
      accent: 'amber',
      enabled: true,
    },
    {
      id: 'dynamique-audacieux',
      title: 'Dynamique & Audacieux',
      description: 'Énergie forte, contrastes marqués, identité mémorable.',
      icon: 'zap',
      accent: 'violet',
      enabled: true,
    },
    {
      id: 'serieux-professionnel',
      title: 'Sérieux & Professionnel',
      description: 'Crédibilité corporate, structure rassurante et institutionnelle.',
      icon: 'briefcase',
      accent: 'emerald',
      enabled: true,
    },
    {
      id: 'conseil-agence',
      title: 'Laisser Logo Design conseiller',
      description: 'Carte blanche stratégique selon votre marché et votre cible.',
      icon: 'compass',
      accent: 'blue',
      enabled: true,
    },
  ],
  existingLogoOptions: [
    {
      id: 'yes-files',
      label: 'Oui, je vais vous envoyer les fichiers',
      enabled: true,
    },
    {
      id: 'no-scratch',
      label: 'Non, création de zéro',
      enabled: true,
    },
  ],
  printSupports: [
    { id: 'cards', label: 'Cartes de visite / Papeterie', enabled: true },
    { id: 'flyers', label: 'Flyers / Dépliants / Menus', enabled: true },
    { id: 'labels', label: 'Étiquettes adhésives / Flacons', enabled: true },
    { id: 'boxes', label: 'Boîtes / Emballages carton', enabled: true },
    { id: 'banners', label: 'Bâches / Roll-up / Enseignes', enabled: true },
    { id: 'textile', label: 'Textile (T-shirts, sacs...)', enabled: true },
    { id: 'none-digital', label: 'Aucun (100% Digital)', enabled: true },
  ],
  printerSituations: [
    {
      id: 'has-printer-template',
      label: "J'ai déjà un imprimeur et son gabarit technique (tracé de découpe)",
      enabled: true,
    },
    {
      id: 'has-printer-no-template',
      label: "J'ai un imprimeur mais pas encore de gabarit",
      enabled: true,
    },
    {
      id: 'no-printer',
      label: "Je n'ai pas encore d'imprimeur",
      enabled: true,
    },
  ],
  printFinishes: [
    { id: 'standard', label: 'Standard (Mat ou Brillant)', enabled: true },
    { id: 'foil', label: 'Dorure à chaud (Or/Argent)', enabled: true },
    { id: 'spot-uv', label: 'Vernis sélectif', enabled: true },
    { id: 'textured', label: 'Papier texturé / Kraft / Transparent', enabled: true },
    { id: 'advice', label: 'Besoin des conseils de Logo Design', enabled: true },
  ],
  customFields: [],
};

export function generateReferenceCode(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LD-${y}${m}${d}-${rand}`;
}

export function createInitialFormData(schema: BriefSchema): BriefFormData {
  const preselected = schema.services
    .filter((s) => s.enabled && s.preselected)
    .map((s) => s.id);

  return {
    referenceCode: generateReferenceCode(),
    fullName: '',
    brandName: '',
    whatsapp: '',
    email: '',
    selectedServices: preselected,
    customNeedNote: '',
    projectDescription: '',
    targetAudience: '',
    exactTextToInclude: '',
    selectedStyles: [],
    colorPreferences: '',
    hasExistingLogo: '',
    printSupports: [],
    printDimensions: '',
    printerSituation: '',
    printFinishes: [],
    inspirationNotes: '',
    uploadedFiles: [],
    deadline: '',
    deadlineMode: 'date',
    customAnswers: {},
  };
}

export const BUILT_IN_PRESETS: SavedPreset[] = [
  {
    id: 'preset-full',
    name: 'Brief Complet Studio (Défaut)',
    description: 'Toutes les catégories (Identité, Packaging, 3D, Digital, Signalétique, Exécution).',
    createdAt: '2026-01-01',
    schema: DEFAULT_BRIEF_SCHEMA,
  },
  {
    id: 'preset-digital',
    name: 'Identité & Digital (Sans Print)',
    description: 'Focus Branding, Réseaux Sociaux & Web (section Impression masquée).',
    createdAt: '2026-01-01',
    schema: {
      ...DEFAULT_BRIEF_SCHEMA,
      agency: {
        ...DEFAULT_BRIEF_SCHEMA.agency,
        clientGreetingNote:
          'Brief optimisé pour votre projet d’identité visuelle et présence digitale.',
      },
      steps: DEFAULT_BRIEF_SCHEMA.steps.map((st) =>
        st.id === 'print' ? { ...st, enabled: false } : st
      ),
      services: DEFAULT_BRIEF_SCHEMA.services.map((srv) => ({
        ...srv,
        enabled: [
          'id-logo',
          'id-charte',
          'id-rebranding',
          'id-naming',
          'com-social',
          'com-web',
          'exec-design',
        ].includes(srv.id),
        preselected: ['id-logo', 'id-charte'].includes(srv.id),
      })),
    },
  },
  {
    id: 'preset-packaging',
    name: 'Packaging, Print & Livraison',
    description: 'Pré-configuré pour boîtes, étiquettes, mockup 3D, impression et livraison.',
    createdAt: '2026-01-01',
    schema: {
      ...DEFAULT_BRIEF_SCHEMA,
      agency: {
        ...DEFAULT_BRIEF_SCHEMA.agency,
        clientGreetingNote:
          'Merci de préciser vos dimensions exactes et finitions souhaitées pour vos supports imprimés.',
      },
      services: DEFAULT_BRIEF_SCHEMA.services.map((srv) => ({
        ...srv,
        preselected: ['pack-boite', 'pack-etiquette', 'exec-print'].includes(srv.id),
      })),
    },
  },
  {
    id: 'preset-3d-signage',
    name: '3D, Architecture & Signalétique',
    description: 'Orienté modélisation 3D, rendu architectural, stands, enseignes & pose sur place.',
    createdAt: '2026-01-01',
    schema: {
      ...DEFAULT_BRIEF_SCHEMA,
      services: DEFAULT_BRIEF_SCHEMA.services.map((srv) => ({
        ...srv,
        preselected: ['3d-arch', 'sig-enseigne', 'exec-install'].includes(srv.id),
      })),
    },
  },
];
