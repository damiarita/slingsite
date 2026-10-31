// The dropzone: the first step of every compressor page, set as its hero.
'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { PrimaryButton } from './buttons';
import type { CompressionInput } from '@/types/compressor';
import type { UploadDictionary } from '@/i18n/type';
import { inputFormatNames, inputFormats } from '@/utils/tool-pages';
import { fill, formatList } from '@/utils/i18n-format';
import { fetchSamplePhotos } from '@/utils/samples';

interface FileUploadProps {
  onFilesAdded: (files: File[], options?: { sample?: boolean }) => void;
  type: CompressionInput;
  translations: UploadDictionary;
  locale: string;
  // The hidden input, so "Add more" further down can open the same picker.
  inputId: string;
  // Image pages only: a link that loads two sample photos.
  samples?: boolean;
}

export const FileUpload = ({
  onFilesAdded,
  type,
  translations,
  locale,
  inputId,
  samples,
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sampleState, setSampleState] = useState<'idle' | 'loading' | 'error'>(
    'idle',
  );

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      onFilesAdded(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files?.length) {
      onFilesAdded(Array.from(e.target.files));
    }
    // Picking the same files again must fire another change.
    e.target.value = '';
  };
  const loadSamples = () => {
    setSampleState('loading');
    fetchSamplePhotos()
      .then((files) => {
        setSampleState('idle');
        onFilesAdded(files, { sample: true });
      })
      .catch(() => setSampleState('error'));
  };

  const formats = formatList(
    locale,
    inputFormats[type].map((format) => inputFormatNames[format]),
  );

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`grid min-h-72 place-items-center rounded-card border-2 border-dashed px-4 py-10 text-center transition-colors duration-200 sm:px-6 lg:min-h-[min(38.75rem,calc(100svh-14rem))] ${
        isDragging
          ? 'border-accent-deep bg-accent-wash'
          : 'border-dash bg-paper-2'
      }`}
    >
      <input
        id={inputId}
        type="file"
        multiple
        // MOV/MKV often come without a video/* MIME type
        accept={type === 'video' ? 'video/*,.mov,.mkv' : 'image/*'}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleChange}
      />
      <div className="grid justify-items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full bg-paper text-ink sm:size-18">
          <Upload className="size-6" aria-hidden="true" />
        </span>
        <p className="max-w-[18ch] text-xl leading-tight font-semibold tracking-[-0.02em] sm:text-2xl">
          {type === 'video' ? translations.dropVideos : translations.dropImages}
        </p>
        <PrimaryButton
          onClick={() => document.getElementById(inputId)?.click()}
        >
          {translations.browse}
        </PrimaryButton>
        <p className="max-w-[42ch] text-sm text-muted">
          {fill(
            type === 'video'
              ? translations.noteVideos
              : translations.noteImages,
            { formats },
          )}
        </p>
        {samples && (
          <button
            type="button"
            onClick={loadSamples}
            disabled={sampleState === 'loading'}
            aria-busy={sampleState === 'loading'}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-accent-deep underline underline-offset-[0.2em] hover:text-ink disabled:cursor-progress"
          >
            {translations.sample}
          </button>
        )}
        {sampleState === 'error' && (
          <p role="status" className="text-sm text-error">
            {translations.sampleError}
          </p>
        )}
      </div>
    </div>
  );
};
