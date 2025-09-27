// A reusable component for handling file uploads via drag-and-drop or file selection.
'use client';

import { useState, useRef } from 'react';
import type { UploadArea } from '@/i18n/dictioraries/type';
import { ImagePlus} from 'lucide-react';
import { CompressionInput } from '@/types/compressor';

interface FileUploadProps {
  onFilesAdded: (files: File[]) => void;
  type: CompressionInput
}

export const FileUpload = ({ onFilesAdded, type }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      onFilesAdded(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files?.length) {
      onFilesAdded(Array.from(e.target.files));
    }
  };
  const onButtonClick = () => { if(fileInputRef.current) fileInputRef.current.click(); else throw new Error("fileInputRef.current is not defined") };

  return (
    <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400'}`}>
      <input ref={fileInputRef} type="file" multiple accept={type+"/*"} className="hidden" onChange={handleChange} />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center"> <ImagePlus className={`w-8 h-8 transition-colors duration-300 ${isDragging ? 'text-blue-600' : 'text-gray-500'}`} /> </div>
        <p className="text-gray-600"> <span className="font-semibold text-blue-600 cursor-pointer" onClick={onButtonClick}>Click to upload</span> or drag and drop </p>
        <p className="text-xs text-gray-500">Supports JPG, PNG, WEBP, GIF</p>
      </div>
    </div>
  );
};