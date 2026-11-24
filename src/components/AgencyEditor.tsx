import React, { useRef, useState } from 'react';
import {
  BriefFormData,
  BriefSchema,
  CustomField,
  Language,
  SavedPreset,
  ServiceOption,
  StepId,
} from '../types/brief';
import { BUILT_IN_PRESETS, SERVICE_CATEGORIES } from '../data/defaultSchema';

interface AgencyEditorProps {
  schema: BriefSchema;
  onUpdateSchema: (next: BriefSchema) => void;
  formData: BriefFormData;
  onUpdateFormData: <K extends keyof BriefFormData>(field: K, value: BriefFormData[K]) => void;
  savedPresets: SavedPreset[];
  onSavePreset: (name: string, description: string) => void;
  onDeletePreset: (id: string) => void;
  onResetSchema: () => void;
  onCloseEditor: () => void;
  onOpenShareModal: () => void;
  onExportBlankPdf: () => Promise<void>;
  lang: Language;
  darkMode: boolean;
}

type EditorTab = 'services' | 'steps' | 'identity' | 'templates';

export const AgencyEditor: React.FC<AgencyEditorProps> = ({
  schema,
  onUpdateSchema,
  formData,
  onUpdateFormData,
  savedPresets,
  onSavePreset,
  onDeletePreset,
  onResetSchema,
  onCloseEditor,
  onOpenShareModal,
  onExportBlankPdf,
  lang,
  darkMode,
}) => {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState<EditorTab>('services');
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState<string>(SERVICE_CATEGORIES[0]);
  const [newServiceSubtitle, setNewServiceSubtitle] = useState('');

  const [newQStep, setNewQStep] = useState<StepId>('project');
  const [newQLabel, setNewQLabel] = useState('');
  const [newQType, setNewQType] = useState<CustomField['type']>('text');
  const [newQOptions, setNewQOptions] = useState('');
  const [newQRequired, setNewQRequired] = useState(false);

  const [newStyleTitle, setNewStyleTitle] = useState('');
  const [newSupportLabel, setNewSupportLabel] = useState('');
  const [newFinishLabel, setNewFinishLabel] = useState('');

  const [presetName, setPresetName] = useState('');
  const [presetDesc, setPresetDesc] = useState('');
  const [importError, setImportError] = useState('');
  const fileImportRef = useRef<HTMLInputElement | null>(null);

  const cardClass = `rounded-xl border p-5 ${
    darkMode ? 'form-card-glass-dark' : 'form-card-glass'
  }`;

  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${
    darkMode
      ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-teal-500'
      : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-teal-700'
  }`;

  const updateService = (id: string, patch: Partial<ServiceOption>) => {
    onUpdateSchema({
      ...schema,
      services: schema.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  const moveService = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= schema.services.length) return;
    const copy = [...schema.services];
    const [item] = copy.splice(idx, 1);
    copy.splice(target, 0, item);
    onUpdateSchema({ ...schema, services: copy });
  };

  const deleteService = (id: string) => {
    onUpdateSchema({
      ...schema,
      services: schema.services.filter((s) => s.id !== id),
    });
    if (formData.selectedServices.includes(id)) {
      onUpdateFormData(
        'selectedServices',
        formData.selectedServices.filter((s) => s !== id)
      );
    }
  };

  const addService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceTitle.trim()) return;
    const newItem: ServiceOption = {
      id: `srv-${Date.now().toString(36)}`,
      title: newServiceTitle.trim(),
      subtitle: newServiceSubtitle.trim(),
      tag: newServiceCategory,
      icon: 'check-circle',
      accent: 'emerald',
      enabled: true,
      preselected: false,
    };
    onUpdateSchema({
      ...schema,
      services: [...schema.services, newItem],
    });
    setNewServiceTitle('');
    setNewServiceSubtitle('');
  };

  const togglePreselectService = (id: string) => {
    const srv = schema.services.find((s) => s.id === id);
    if (!srv) return;
    const nextPre = !srv.preselected;
    updateService(id, { preselected: nextPre });
    if (nextPre && !formData.selectedServices.includes(id)) {
      onUpdateFormData('selectedServices', [...formData.selectedServices, id]);
    } else if (!nextPre && formData.selectedServices.includes(id)) {
      onUpdateFormData(
        'selectedServices',
        formData.selectedServices.filter((x) => x !== id)
      );
    }
  };

  const addCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQLabel.trim()) return;
    const parsedOptions =
      newQType === 'select' || newQType === 'checkbox-group'
        ? newQOptions
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean)
        : undefined;

    if (
      (newQType === 'select' || newQType === 'checkbox-group') &&
      (!parsedOptions || parsedOptions.length === 0)
    ) {
      return;
    }

    const field: CustomField = {
      id: `q-${Date.now().toString(36)}`,
      stepId: newQStep,
      label: newQLabel.trim(),
      type: newQType,
      options: parsedOptions,
      required: newQRequired,
      enabled: true,
    };
    onUpdateSchema({
      ...schema,
      customFields: [...schema.customFields, field],
    });
    setNewQLabel('');
    setNewQOptions('');
    setNewQRequired(false);
  };

  const deleteCustomField = (id: string) => {
    onUpdateSchema({
      ...schema,
      customFields: schema.customFields.filter((f) => f.id !== id),
    });
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logo-design-brief-modele.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (file: File | undefined) => {
    if (!file) return;
    setImportError('');
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as BriefSchema;
        if (!parsed.agency || !Array.isArray(parsed.services) || !Array.isArray(parsed.steps)) {
          setImportError('Fichier JSON invalide.');
          return;
        }
        onUpdateSchema(parsed);
      } catch {
        setImportError('Impossible de lire ce fichier JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 animate-step-enter">
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">
              {isEn ? 'Customize form & requested needs' : 'Personnaliser le formulaire & les besoins'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isEn
                ? 'Tailor services and questions before sharing or exporting to PDF (no pricing).'
                : "Adaptez les besoins et questions avant de partager ou d'exporter en PDF (sans tarification)."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenShareModal}
              className="rounded-lg bg-teal-700 hover:bg-teal-800 px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
            >
              {isEn ? 'Share with client' : 'Partager au client'}
            </button>
            <button
              type="button"
              onClick={() => void onExportBlankPdf()}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer ${
                darkMode
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              {isEn ? 'Template PDF' : 'PDF Modèle'}
            </button>
            <button
              type="button"
              onClick={onCloseEditor}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer ${
                darkMode
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'border-zinc-300 bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              {isEn ? 'View form' : 'Voir le formulaire'}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-zinc-200/70 dark:border-zinc-800 pt-3.5">
          {[
            { id: 'services' as EditorTab, label: isEn ? 'Services & Needs' : 'Besoins & Services' },
            { id: 'steps' as EditorTab, label: isEn ? 'Sections & Questions' : 'Sections & Questions' },
            { id: 'identity' as EditorTab, label: isEn ? 'Agency & Pre-fill' : 'Agence & Pré-remplissage' },
            { id: 'templates' as EditorTab, label: isEn ? 'Templates & Export' : 'Modèles & Export' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-teal-700 text-white'
                  : darkMode
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'services' && (
        <div className="space-y-4">
          <form onSubmit={addService} className={cardClass}>
            <h3 className="text-sm font-bold mb-3">
              {isEn ? 'Add a new service / need (no pricing)' : 'Ajouter un nouveau besoin / service (sans tarif)'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <select
                value={newServiceCategory}
                onChange={(e) => setNewServiceCategory(e.target.value)}
                className={inputClass}
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newServiceTitle}
                onChange={(e) => setNewServiceTitle(e.target.value)}
                placeholder={isEn ? 'Title (e.g. QR Code Menu)' : 'Titre (ex : Menu QR Code)'}
                className={inputClass}
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newServiceSubtitle}
                  onChange={(e) => setNewServiceSubtitle(e.target.value)}
                  placeholder={isEn ? 'Details (optional)' : 'Précision (optionnel)'}
                  className={inputClass}
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-teal-700 hover:bg-teal-800 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  {isEn ? 'Add' : 'Ajouter'}
                </button>
              </div>
            </div>
          </form>

          <div className={cardClass}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-bold">
                {isEn ? 'Services list' : 'Liste des besoins'} ({schema.services.filter((s) => s.enabled).length}/
                {schema.services.length} {isEn ? 'active' : 'actifs'})
              </h3>
              <span className="text-xs text-zinc-400">
                {isEn
                  ? 'Pre-select checks an item ahead of time for your client.'
                  : "Pré-sélectionner coche un besoin à l'avance pour votre client."}
              </span>
            </div>

            <div className="space-y-2.5">
              {schema.services.map((srv, idx) => (
                <div
                  key={srv.id}
                  className={`rounded-lg border p-3 ${
                    srv.enabled
                      ? darkMode
                        ? 'border-zinc-800 bg-zinc-900/60'
                        : 'border-zinc-200 bg-zinc-50/70'
                      : 'border-zinc-200/50 dark:border-zinc-800/50 opacity-55'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={srv.tag}
                      onChange={(e) => updateService(srv.id, { tag: e.target.value })}
                      placeholder={isEn ? 'Category' : 'Catégorie'}
                      className={inputClass}
                      aria-label="Catégorie"
                    />
                    <input
                      type="text"
                      value={srv.title}
                      onChange={(e) => updateService(srv.id, { title: e.target.value })}
                      className={inputClass}
                      aria-label="Titre du besoin"
                    />
                    <input
                      type="text"
                      value={srv.subtitle}
                      onChange={(e) => updateService(srv.id, { subtitle: e.target.value })}
                      placeholder={isEn ? 'Subtitle (optional)' : 'Sous-titre (optionnel)'}
                      className={inputClass}
                      aria-label="Description du besoin"
                    />
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => moveService(idx, -1)}
                        disabled={idx === 0}
                        className="rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 disabled:opacity-30 cursor-pointer"
                      >
                        Monter
                      </button>
                      <button
                        type="button"
                        onClick={() => moveService(idx, 1)}
                        disabled={idx === schema.services.length - 1}
                        className="rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 disabled:opacity-30 cursor-pointer"
                      >
                        Descendre
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => togglePreselectService(srv.id)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium cursor-pointer ${
                          srv.preselected
                            ? 'border-teal-700 bg-teal-700 text-white'
                            : darkMode
                            ? 'border-zinc-700 text-zinc-300'
                            : 'border-zinc-300 bg-white text-zinc-600'
                        }`}
                      >
                        {srv.preselected ? 'Pré-sélectionné' : 'Pré-sélectionner'}
                      </button>

                      <button
                        type="button"
                        onClick={() => updateService(srv.id, { enabled: !srv.enabled })}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium cursor-pointer ${
                          srv.enabled
                            ? darkMode
                              ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
                              : 'border-zinc-300 bg-white text-zinc-800'
                            : 'border-zinc-300/60 text-zinc-400'
                        }`}
                      >
                        {srv.enabled ? 'Visible' : 'Masqué'}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteService(srv.id)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'steps' && (
        <div className="space-y-4">
          <div className={cardClass}>
            <h3 className="text-sm font-bold mb-3">Sections du formulaire (réparties sur 2 pages max)</h3>
            <div className="space-y-2.5">
              {schema.steps.map((step, i) => {
                const isFirst = step.id === 'general';
                const pageLabel = step.id === 'general' || step.id === 'project' ? 'Page 1' : 'Page 2';
                return (
                  <div
                    key={step.id}
                    className={`rounded-lg border p-3 ${
                      darkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-zinc-50/70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="shrink-0 text-xs font-semibold text-zinc-400 w-14">
                        {pageLabel}
                      </span>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) =>
                          onUpdateSchema({
                            ...schema,
                            steps: schema.steps.map((s) =>
                              s.id === step.id ? { ...s, title: e.target.value } : s
                            ),
                          })
                        }
                        className={inputClass}
                      />
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() =>
                          onUpdateSchema({
                            ...schema,
                            steps: schema.steps.map((s) =>
                              s.id === step.id ? { ...s, enabled: !s.enabled } : s
                            ),
                          })
                        }
                        className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold ${
                          isFirst
                            ? 'border-zinc-200 dark:border-zinc-700 text-zinc-400 cursor-not-allowed'
                            : step.enabled
                            ? 'border-teal-700 bg-teal-700 text-white cursor-pointer'
                            : 'border-zinc-300 dark:border-zinc-700 text-zinc-500 cursor-pointer'
                        }`}
                      >
                        {isFirst
                          ? `Section ${i + 1} (Requise)`
                          : step.enabled
                          ? `Section ${i + 1} Active`
                          : `Section ${i + 1} Masquée`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={addCustomField} className={cardClass}>
            <h3 className="text-sm font-bold mb-3">Ajouter une question personnalisée</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <select
                value={newQStep}
                onChange={(e) => setNewQStep(e.target.value as StepId)}
                className={inputClass}
              >
                {schema.steps.map((st, idx) => (
                  <option key={st.id} value={st.id}>
                    Section {idx + 1} : {st.shortTitle}
                  </option>
                ))}
              </select>
              <select
                value={newQType}
                onChange={(e) => setNewQType(e.target.value as CustomField['type'])}
                className={inputClass}
              >
                <option value="text">Réponse courte</option>
                <option value="textarea">Paragraphe</option>
                <option value="select">Choix unique</option>
                <option value="checkbox-group">Cases à cocher</option>
              </select>
            </div>

            <div className="mt-2.5 flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={newQLabel}
                onChange={(e) => setNewQLabel(e.target.value)}
                placeholder="Votre question..."
                className={inputClass}
              />
              <div className="flex items-center gap-3 shrink-0">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newQRequired}
                    onChange={(e) => setNewQRequired(e.target.checked)}
                    className="accent-teal-700"
                  />
                  <span>Obligatoire</span>
                </label>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-700 hover:bg-teal-800 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {(newQType === 'select' || newQType === 'checkbox-group') && (
              <div className="mt-2.5">
                <input
                  type="text"
                  value={newQOptions}
                  onChange={(e) => setNewQOptions(e.target.value)}
                  placeholder="Options séparées par des virgules (ex : Français, Arabe, Anglais)"
                  className={inputClass}
                />
              </div>
            )}

            {schema.customFields.length > 0 && (
              <div className="mt-4 pt-3 border-t border-zinc-200/70 dark:border-zinc-800 space-y-2">
                {schema.customFields.map((qf) => (
                  <div
                    key={qf.id}
                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                      darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'
                    }`}
                  >
                    <span>
                      <strong>{qf.label}</strong>{' '}
                      <span className="text-xs text-zinc-400">
                        ({schema.steps.find((s) => s.id === qf.stepId)?.shortTitle})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteCustomField(qf.id)}
                      className="text-xs font-medium text-rose-500 hover:underline cursor-pointer"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={cardClass}>
              <h4 className="text-sm font-bold mb-2">Styles visuels</h4>
              <div className="space-y-1.5 mb-3 max-h-44 overflow-y-auto">
                {schema.styles.map((st) => (
                  <div key={st.id} className="flex items-center justify-between text-xs py-1">
                    <span className={st.enabled ? '' : 'line-through opacity-50'}>{st.title}</span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSchema({
                          ...schema,
                          styles: schema.styles.map((x) =>
                            x.id === st.id ? { ...x, enabled: !x.enabled } : x
                          ),
                        })
                      }
                      className="text-teal-700 dark:text-teal-400 font-medium cursor-pointer"
                    >
                      {st.enabled ? 'Masquer' : 'Afficher'}
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newStyleTitle}
                  onChange={(e) => setNewStyleTitle(e.target.value)}
                  placeholder="Nouveau style..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newStyleTitle.trim()) return;
                    onUpdateSchema({
                      ...schema,
                      styles: [
                        ...schema.styles,
                        {
                          id: `st-${Date.now().toString(36)}`,
                          title: newStyleTitle.trim(),
                          description: '',
                          icon: 'check-circle',
                          accent: 'emerald',
                          enabled: true,
                        },
                      ],
                    });
                    setNewStyleTitle('');
                  }}
                  className="rounded-lg bg-teal-700 px-3 text-xs font-bold text-white cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className={cardClass}>
              <h4 className="text-sm font-bold mb-2">Supports Print</h4>
              <div className="space-y-1.5 mb-3 max-h-44 overflow-y-auto">
                {schema.printSupports.map((sp) => (
                  <div key={sp.id} className="flex items-center justify-between text-xs py-1">
                    <span className={sp.enabled ? '' : 'line-through opacity-50'}>{sp.label}</span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSchema({
                          ...schema,
                          printSupports: schema.printSupports.map((x) =>
                            x.id === sp.id ? { ...x, enabled: !x.enabled } : x
                          ),
                        })
                      }
                      className="text-teal-700 dark:text-teal-400 font-medium cursor-pointer"
                    >
                      {sp.enabled ? 'Masquer' : 'Afficher'}
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newSupportLabel}
                  onChange={(e) => setNewSupportLabel(e.target.value)}
                  placeholder="Nouveau support..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newSupportLabel.trim()) return;
                    onUpdateSchema({
                      ...schema,
                      printSupports: [
                        ...schema.printSupports,
                        {
                          id: `sup-${Date.now().toString(36)}`,
                          label: newSupportLabel.trim(),
                          enabled: true,
                        },
                      ],
                    });
                    setNewSupportLabel('');
                  }}
                  className="rounded-lg bg-teal-700 px-3 text-xs font-bold text-white cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className={cardClass}>
              <h4 className="text-sm font-bold mb-2">Finitions Print</h4>
              <div className="space-y-1.5 mb-3 max-h-44 overflow-y-auto">
                {schema.printFinishes.map((fn) => (
                  <div key={fn.id} className="flex items-center justify-between text-xs py-1">
                    <span className={fn.enabled ? '' : 'line-through opacity-50'}>{fn.label}</span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSchema({
                          ...schema,
                          printFinishes: schema.printFinishes.map((x) =>
                            x.id === fn.id ? { ...x, enabled: !x.enabled } : x
                          ),
                        })
                      }
                      className="text-teal-700 dark:text-teal-400 font-medium cursor-pointer"
                    >
                      {fn.enabled ? 'Masquer' : 'Afficher'}
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newFinishLabel}
                  onChange={(e) => setNewFinishLabel(e.target.value)}
                  placeholder="Nouvelle finition..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newFinishLabel.trim()) return;
                    onUpdateSchema({
                      ...schema,
                      printFinishes: [
                        ...schema.printFinishes,
                        {
                          id: `fin-${Date.now().toString(36)}`,
                          label: newFinishLabel.trim(),
                          enabled: true,
                        },
                      ],
                    });
                    setNewFinishLabel('');
                  }}
                  className="rounded-lg bg-teal-700 px-3 text-xs font-bold text-white cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'identity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={cardClass}>
            <h3 className="text-sm font-bold mb-3">En-tête &amp; Coordonnées</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Nom de l&apos;agence</label>
                <input
                  type="text"
                  value={schema.agency.agencyName}
                  onChange={(e) =>
                    onUpdateSchema({
                      ...schema,
                      agency: { ...schema.agency, agencyName: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Titre d&apos;accueil</label>
                <input
                  type="text"
                  value={schema.agency.heroTitle}
                  onChange={(e) =>
                    onUpdateSchema({
                      ...schema,
                      agency: { ...schema.agency, heroTitle: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Sous-titre</label>
                <textarea
                  rows={2}
                  value={schema.agency.heroSubtitle}
                  onChange={(e) =>
                    onUpdateSchema({
                      ...schema,
                      agency: { ...schema.agency, heroSubtitle: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={schema.agency.whatsappDisplay}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdateSchema({
                        ...schema,
                        agency: {
                          ...schema.agency,
                          whatsappDisplay: val,
                          whatsappNumber: val.replace(/[^\d]/g, '') || '212771663435',
                        },
                      });
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={schema.agency.email}
                    onChange={(e) =>
                      onUpdateSchema({
                        ...schema,
                        agency: { ...schema.agency, email: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-sm font-bold mb-3">Pré-remplir pour un client</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Note d&apos;accueil dédiée
                </label>
                <input
                  type="text"
                  value={schema.agency.clientGreetingNote}
                  onChange={(e) =>
                    onUpdateSchema({
                      ...schema,
                      agency: { ...schema.agency, clientGreetingNote: e.target.value },
                    })
                  }
                  placeholder="Ex : Bonjour, voici votre brief personnalisé."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Nom du client</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => onUpdateFormData('fullName', e.target.value)}
                  placeholder="Optionnel"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Marque / Entreprise</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => onUpdateFormData('brandName', e.target.value)}
                  placeholder="Optionnel"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Note sur les besoins</label>
                <input
                  type="text"
                  value={formData.customNeedNote}
                  onChange={(e) => onUpdateFormData('customNeedNote', e.target.value)}
                  placeholder="Optionnel"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className={cardClass}>
            <h3 className="text-sm font-bold mb-3">Modèles prêts à l&apos;emploi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUILT_IN_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className={`flex flex-col justify-between rounded-lg border p-3.5 ${
                    darkMode ? 'border-zinc-800 bg-zinc-900/60' : 'border-zinc-200 bg-zinc-50'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-semibold">{preset.name}</h4>
                    <p className="mt-1 text-xs text-zinc-400">{preset.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSchema(preset.schema);
                      const pre = preset.schema.services
                        .filter((s) => s.enabled && s.preselected)
                        .map((s) => s.id);
                      onUpdateFormData('selectedServices', pre);
                    }}
                    className="mt-3 self-start rounded-lg bg-teal-700 hover:bg-teal-800 px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
                  >
                    Appliquer
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-sm font-bold mb-3">Sauvegarder comme modèle</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Nom du modèle..."
                className={inputClass}
              />
              <input
                type="text"
                value={presetDesc}
                onChange={(e) => setPresetDesc(e.target.value)}
                placeholder="Note courte..."
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => {
                  if (!presetName.trim()) return;
                  onSavePreset(presetName.trim(), presetDesc.trim());
                  setPresetName('');
                  setPresetDesc('');
                }}
                className="rounded-lg bg-teal-700 hover:bg-teal-800 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Enregistrer
              </button>
            </div>

            {savedPresets.length > 0 && (
              <div className="mt-3 space-y-2">
                {savedPresets.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${
                      darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateSchema(p.schema)}
                        className="rounded bg-teal-700 px-2.5 py-1 text-xs font-semibold text-white cursor-pointer"
                      >
                        Charger
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePreset(p.id)}
                        className="text-xs font-medium text-rose-500 hover:underline cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={cardClass}>
            <h3 className="text-sm font-bold mb-3">Export &amp; Réinitialisation</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void onExportBlankPdf()}
                className="rounded-lg bg-teal-700 hover:bg-teal-800 px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Télécharger Fiche PDF
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                className={`rounded-lg border px-3.5 py-2 text-xs font-medium cursor-pointer ${
                  darkMode
                    ? 'border-zinc-700 bg-zinc-800 text-zinc-200'
                    : 'border-zinc-300 bg-white text-zinc-700'
                }`}
              >
                Exporter (.json)
              </button>
              <button
                type="button"
                onClick={() => fileImportRef.current?.click()}
                className={`rounded-lg border px-3.5 py-2 text-xs font-medium cursor-pointer ${
                  darkMode
                    ? 'border-zinc-700 bg-zinc-800 text-zinc-200'
                    : 'border-zinc-300 bg-white text-zinc-700'
                }`}
              >
                Importer (.json)
              </button>
              <input
                ref={fileImportRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  handleImportJson(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={onResetSchema}
                className="ml-auto rounded-lg border border-rose-500/30 px-3.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 cursor-pointer"
              >
                Réinitialiser
              </button>
            </div>
            {importError && <p className="mt-2 text-xs text-rose-500">{importError}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
