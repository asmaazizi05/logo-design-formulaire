import React, { useRef, useState } from 'react';
import { BriefFormData, BriefSchema, Language, UploadedFileItem } from '../../types/brief';
import { UI_TEXT } from '../../data/translations';
import { formatFileSize } from '../../utils/summaryFormatter';
import { CustomFieldsRenderer } from '../CustomFieldsRenderer';

interface Step5Props {
  schema: BriefSchema;
  data: BriefFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof BriefFormData>(field: K, value: BriefFormData[K]) => void;
  onCustomChange: (fieldId: string, value: string | string[]) => void;
  lang: Language;
  darkMode: boolean;
}

async function createImageThumbnail(file: File): Promise<string | undefined> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return undefined;
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(outputType, 0.82));
      };
      img.onerror = () => resolve(undefined);
      img.src = String(reader.result);
    };
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}

export const Step5Inspiration: React.FC<Step5Props> = ({
  schema,
  data,
  errors,
  onChange,
  onCustomChange,
  lang,
  darkMode,
}) => {
  const t = UI_TEXT[lang];
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const customFields = schema.customFields.filter((f) => f.stepId === 'inspiration');

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newItems: UploadedFileItem[] = [];
    for (const file of Array.from(fileList)) {
      const previewDataUrl = await createImageThumbnail(file);
      newItems.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        previewDataUrl,
      });
    }
    onChange('uploadedFiles', [...data.uploadedFiles, ...newItems]);
  };

  const removeFile = (id: string) => {
    onChange(
      'uploadedFiles',
      data.uploadedFiles.filter((f) => f.id !== id)
    );
  };

  const cardClass = `rounded-xl border p-5 sm:p-6 ${
    darkMode ? 'form-card-glass-dark' : 'form-card-glass'
  }`;

  const inputBase = darkMode
    ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-teal-500'
    : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-teal-700';

  const labelClass = `block text-[15px] font-semibold mb-3 ${
    darkMode ? 'text-zinc-100' : 'text-zinc-900'
  }`;

  return (
    <div className="space-y-4">
      <div className={cardClass}>
        <label htmlFor="inspirationNotes" className={labelClass}>
          {t.inspirationLinks}
        </label>
        <textarea
          id="inspirationNotes"
          rows={4}
          value={data.inspirationNotes}
          onChange={(e) => onChange('inspirationNotes', e.target.value)}
          placeholder={t.inspirationPlaceholder}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-colors ${inputBase}`}
        />
      </div>

      <div className={cardClass}>
        <h3 className={labelClass}>
          {t.uploadTitle}{' '}
          <span className="text-xs font-normal text-zinc-400">{t.uploadHelper}</span>
        </h3>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            void handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-7 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-teal-600 bg-teal-500/10'
              : darkMode
              ? 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500'
              : 'border-zinc-300 bg-zinc-50 hover:border-teal-700'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.svg,.ai,.eps,.psd,.zip,.rar"
            className="hidden"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <p className={`text-sm font-medium ${darkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>
            {t.dragText}{' '}
            <span className="text-teal-700 dark:text-teal-400 underline underline-offset-2">
              {t.browseFiles}
            </span>
          </p>
          <p className="mt-1 text-xs text-zinc-400">PNG, JPG, SVG, PDF, AI, EPS, ZIP</p>
        </div>

        {data.uploadedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {data.uploadedFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                  darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {file.previewDataUrl && (
                    <img
                      src={file.previewDataUrl}
                      alt={file.name}
                      className="h-9 w-9 shrink-0 rounded object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{file.name}</p>
                    <p className="text-[11px] text-zinc-400">{formatFileSize(file.size, lang)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="text-xs font-medium text-rose-500 hover:underline cursor-pointer"
                >
                  {t.remove}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <label
            htmlFor="deadlineInput"
            className={`text-[15px] font-semibold ${darkMode ? 'text-zinc-100' : 'text-zinc-900'}`}
          >
            {t.deadline}
          </label>

          <div
            className={`inline-flex rounded-md border p-0.5 text-xs ${
              darkMode ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-zinc-100'
            }`}
          >
            <button
              type="button"
              onClick={() => onChange('deadlineMode', 'date')}
              className={`rounded px-2.5 py-1 font-medium cursor-pointer ${
                data.deadlineMode === 'date'
                  ? darkMode
                    ? 'bg-zinc-800 text-white'
                    : 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500'
              }`}
            >
              {t.dateMode}
            </button>
            <button
              type="button"
              onClick={() => onChange('deadlineMode', 'text')}
              className={`rounded px-2.5 py-1 font-medium cursor-pointer ${
                data.deadlineMode === 'text'
                  ? darkMode
                    ? 'bg-zinc-800 text-white'
                    : 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500'
              }`}
            >
              {t.textMode}
            </button>
          </div>
        </div>

        {data.deadlineMode === 'date' ? (
          <input
            id="deadlineInput"
            type="date"
            value={/^\d{4}-\d{2}-\d{2}$/.test(data.deadline) ? data.deadline : ''}
            onChange={(e) => onChange('deadline', e.target.value)}
            className={`w-full sm:w-64 rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${inputBase}`}
          />
        ) : (
          <input
            id="deadlineInput"
            type="text"
            value={data.deadline}
            onChange={(e) => onChange('deadline', e.target.value)}
            placeholder={t.deadlinePlaceholder}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${inputBase}`}
          />
        )}
      </div>

      <CustomFieldsRenderer
        fields={customFields}
        answers={data.customAnswers}
        errors={errors}
        onChange={onCustomChange}
        lang={lang}
        darkMode={darkMode}
      />
    </div>
  );
};
