// A reusable component for handling file uploads via drag-and-drop or file selection.
'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { UploadArea } from '@/i18n/dictioraries/type';


export const FileUpload = ({ onFilesChange, dictionary }: {
  onFilesChange: (files: File[]) => void;
  dictionary: UploadArea;
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesChange(acceptedFiles);
  }, [onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/avif': [],
    },
    noClick: true, // This prevents the root div from triggering file dialog
  });

  return (
    <div
      {...getRootProps()}
      className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-900/25'
      }`}
    >
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
        </svg>
        <div className="mt-4 flex text-sm leading-6 text-gray-600">
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
          >
            <span>{dictionary.title}</span>
            <input {...getInputProps()} id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
          </label>
        </div>
        <p className="text-xs leading-5 text-gray-600">{dictionary.subtitle}</p>
      </div>
    </div>
  );
};