// This is the main stateful component that orchestrates the entire compression process.
// It manages uploaded files, compression settings, and the final results.
'use client';

import { useState, useCallback } from 'react';
import type { Dictionary } from '@/i18n/dictioraries/type';
import useCompressImage, { Format } from '@/hooks/use-compress-image';
import { FileUpload } from './file-upload';
import { DimensionSettings, ViewportSettings } from './dimension-settings';
import { ResultsDisplay, CompressionResult } from './results-display';


// Data structure to hold information about the original uploaded file.
interface OriginalFile {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

export const ImageCompressor = ({ dictionary }: {dictionary: Dictionary}) => {
  const [originalFiles, setOriginalFiles] = useState<OriginalFile[]>([]);
  const [settings, setSettings] = useState<ViewportSettings>({
    mobile: { deviceWidth: 768, method: 'percentage', value: 100 },
    tablet: { deviceWidth: 1200, method: 'percentage', value: 50 },
    desktop: { deviceWidth: 2000, method: 'percentage', value: 33.33 },
  });
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const compress = useCompressImage();

  const handleFilesChange = useCallback((files: File[]) => {
    const newOriginalFiles: OriginalFile[] = [];
    let processedCount = 0;
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          newOriginalFiles.push({
            id: `${file.name}-${file.lastModified}`,
            file,
            previewUrl: img.src,
            width: img.width,
            height: img.height,
          });
          processedCount++;
          if(processedCount === files.length) {
             setOriginalFiles(prev => [...prev, ...newOriginalFiles]);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const calculateDimensions = (
    originalWidth: number,
    originalHeight: number,
    viewport: 'mobile' | 'tablet' | 'desktop'
  ): { width: number; height: number } => {
    const config = settings[viewport];
    const aspectRatio = originalWidth / originalHeight;
    let targetWidth = originalWidth;

    switch (config.method) {
      case 'percentage':
        targetWidth = config.deviceWidth * (config.value / 100);
        break;
      case 'columns':
        targetWidth = config.deviceWidth / config.value;
        break;
      case 'fixedWidth':
        targetWidth = config.value;
        break;
      case 'fixedHeight':
        const targetHeight = config.value;
        return { width: Math.round(targetHeight * aspectRatio), height: targetHeight };
    }

    return { width: Math.round(targetWidth), height: Math.round(targetWidth / aspectRatio) };
  };

  const handleCompress = async () => {
    if (originalFiles.length === 0) return;
    setIsProcessing(true);
    setResults([]);

    const allCompressedFiles: CompressionResult[] = [];
    const formats: Format[] = ['jpg', 'webp', 'avif'];
    const viewports = ['mobile', 'tablet', 'desktop'] as const;

    for (const original of originalFiles) {
      for (const viewport of viewports) {
        const { width, height } = calculateDimensions(original.width, original.height, viewport);
        for (const format of formats) {
          try {
            if(compress) {
              const compressedFile = await compress(original.file, format, width, height);
              allCompressedFiles.push({
                originalId: original.id,
                originalName: original.file.name,
                originalSize: original.file.size,
                viewport,
                format,
                file: compressedFile,
                width,
                height,
              });
              setResults(prev => [...prev, ...allCompressedFiles.slice(-1)]);
            }
          } catch (error) {
            console.error(`Failed to compress ${original.file.name} to ${format} for ${viewport}`, error);
          }
        }
      }
    }
    setIsProcessing(false);
  };


  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadAll = async () => {
    if (results.length === 0) return;

    results.forEach(result => {
      downloadFile(result.file)
    });
  };


  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{dictionary.imageCompressor.title}</h2>
      </div>

      <FileUpload onFilesChange={handleFilesChange} dictionary={dictionary.imageCompressor.uploadArea} />

      <DimensionSettings settings={settings} onSettingsChange={setSettings} dictionary={dictionary.imageCompressor} />

      <div className="text-center">
        <button
          onClick={handleCompress}
          disabled={originalFiles.length === 0 || isProcessing || !compress}
          className="rounded-md bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : dictionary.imageCompressor.compressButton}
        </button>
      </div>

      {isProcessing && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${(results.length / (originalFiles.length * 9)) * 100}%`}}></div>
        </div>
      )}

      {results.length > 0 && (
        <ResultsDisplay 
            results={results} 
            originalFiles={originalFiles} 
            dictionary={dictionary.imageCompressor}
            onDownloadAll={handleDownloadAll}
        />
      )}
    </div>
  );
};