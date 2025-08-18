// This component renders the results of the compression in a clear, organized table format.
// It groups results by the original image and provides download links for each file.
'use client';

import { useMemo } from 'react';
import type { CompressorPageDictionary } from '@/i18n/dictioraries/type';

export interface CompressionResult {
  originalId: string;
  originalName: string;
  originalSize: number;
  viewport: 'mobile' | 'tablet' | 'desktop';
  format: 'jpg' | 'webp' | 'avif';
  file: File;
  width: number;
  height: number;
}

export function downloadResultFile(compressionResult:CompressionResult){
    const file = compressionResult.file;
    
    const fileNamePieces = file.name.split(".");
    fileNamePieces[fileNamePieces.length-2]=fileNamePieces[fileNamePieces.length-2]+'-compressed-'+compressionResult.viewport;
    const downloadFileName = fileNamePieces.join(".");

    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

interface OriginalFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface ResultsDisplayProps {
  results: CompressionResult[];
  originalFiles: OriginalFile[];
  dictionary: CompressorPageDictionary;
  onDownloadAll: () => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const ResultsDisplay = ({ results, originalFiles, dictionary, onDownloadAll }: ResultsDisplayProps) => {
  const groupedResults = useMemo(() => {
    return results.reduce((acc, result) => {
      (acc[result.originalId] = acc[result.originalId] || []).push(result);
      return acc;
    }, {} as Record<string, CompressionResult[]>);
  }, [results]);

  const handleDownload = (result: CompressionResult) => {
    downloadResultFile(result)
  };

  return (
    <div className="bg-white p-6 shadow sm:rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold leading-7 text-gray-900">{dictionary.resultsTitle}</h3>
        <button
            onClick={onDownloadAll}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
        >
            {dictionary.downloadAll}
        </button>
      </div>
      <div className="space-y-8">
        {Object.entries(groupedResults).map(([originalId, fileResults]) => {
          const originalFile = originalFiles.find(f => f.id === originalId);
          if (!originalFile) return null;
          
          return (
            <div key={originalId} className="overflow-hidden rounded-lg border border-gray-200">
              <div className="bg-gray-50 p-4 flex items-center space-x-4">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={originalFile.previewUrl} alt={originalFile.file.name} className="h-16 w-16 object-cover rounded-md" />
                 <div>
                    <h4 className="font-bold text-gray-800">{originalFile.file.name}</h4>
                    <p className="text-sm text-gray-500">{dictionary.original}: {formatBytes(originalFile.file.size)}</p>
                 </div>
              </div>
              <div className="flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{dictionary.viewport.mobile}</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{dictionary.viewport.tablet}</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{dictionary.viewport.desktop}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(['jpg', 'webp', 'avif'] as const).map(format => (
                          <tr key={format}>
                            {(['mobile', 'tablet', 'desktop'] as const).map(viewport => {
                              const result = fileResults.find(r => r.viewport === viewport && r.format === format);
                              return (
                                <td key={`${viewport}-${format}`} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                  {result ? (
                                    <div>
                                      <p><strong>{dictionary.format}:</strong> {result.format.toUpperCase()}</p>
                                      <p><strong>{dictionary.dimensions}:</strong> {result.width}x{result.height}</p>
                                      <p><strong>{dictionary.size}:</strong> {formatBytes(result.file.size)}</p>
                                      <p><strong>{dictionary.reduction}:</strong> 
                                        <span className="text-green-600 font-semibold">
                                          {` ${((1 - result.file.size / result.originalSize) * 100).toFixed(1)}%`}
                                        </span>
                                      </p>
                                      <button onClick={() => handleDownload(result)} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-500">
                                        {dictionary.download}
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex justify-center items-center">
                                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};