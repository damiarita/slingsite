'use client';

import {useState, useEffect} from "react"
import { FileItem } from "@/components/file-item"
import { FileUpload } from "@/components/file-upload"
import { DimensionsSettings, DimensionsConfig } from "@/components/dimension-settings"
import { Package } from "lucide-react";
import useCompressImage from "@/hooks/use-compress-image";
import { ImageFormat, Format } from "@/types/formats";
import { Device } from "@/types/devices";
import {Job } from "@/types/job";
import { createImageJob, isJobFinished, jobNextPendingOutput } from "@/utils/jobs";
import { MediaSize } from "@/types/mediaSizes";

const downloadResultFile=(job:Job, device:Device, format:Format)=>{
  const file = job.outputs[device]?.[format];
  if (file){
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = getDownloadName(file.name, device, format);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getDownloadName(orginalName:string, device:Device, format:Format){
    const fileNamePieces = orginalName.split(".");
    fileNamePieces[fileNamePieces.length-2]=fileNamePieces[fileNamePieces.length-2]+'-compressed-'+device;
    fileNamePieces[fileNamePieces.length-1]=format;
    return fileNamePieces.join(".");
  }
};

const downloadAllFiles=(jobs:Job[])=>{
  jobs.forEach(job => {
    (Object.entries(job.outputs) as [Device, Partial<Record<Format, File>>][]).forEach(([device, formats]) => {
      (Object.entries(formats) as [Format, File][]).forEach(([format,]) => {
        downloadResultFile(job, device, format);
      });
    });
  });
};




export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [processorBusy, setProcessorBusy] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [deviceConfig, setDeviceConfig] = useState<DimensionsConfig>({
    mobile: { enabled: true, screenWidth: 768, sizingType: 'percentage', percentage:100, width: 768, height: 100 },
    tablet: { enabled: true, screenWidth: 1200, sizingType: 'percentage', percentage: 50,  width: 600, height: 100 },
    desktop: { enabled: true, screenWidth: 2000, sizingType: 'percentage', percentage: 33.33, width: 666.66, height: 100 },
  });
  const compressImage = useCompressImage();

  const handleFilesAdded = (newFiles:File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  }

  const handleCompressClick = () => {
    const requestedDevices = Object.entries(deviceConfig).filter(([, config]) => config.enabled).map(([device]) => device) as Device[];
    Promise.all(files.map(file=>createImageJob(file, requestedDevices, deviceConfig))).then(newJobs=>{
      setJobs(prev => [
        ...prev,
        ...newJobs
      ]);
      setFiles([]);
    });
  };

  const handleRemoveJob = (index:number) => {
    setJobs(prev => {
      const newJobs = [...prev];
      newJobs.splice(index, 1);
      return newJobs;
    });
  };
  
  useEffect(() => {
    if (processorBusy) return;

    const nextJob = jobs.find((job)=>!isJobFinished(job));

    if (!nextJob) return;
    const definedNextJob = nextJob as Job; // TypeScript type assertion

    const nextPendingOutput = jobNextPendingOutput(nextJob);

    if(!nextPendingOutput) throw new Error("Inconsistent state: job is not finished but has no pending outputs");
    if(!compressImage) throw new Error("Compressor function not available");
    
    const {device, format} = nextPendingOutput;
    
    setProcessorBusy(true);
    compressImage(nextJob.original, format as ImageFormat, definedNextJob.requestedSizes[device] as MediaSize)
      .then(compressedFile => {
        setJobs(prevJobs => {
          return prevJobs.map(job => {
            if (job.id !== nextJob.id) return job;
            return {
              ...job,
              outputs: {
                ...job.outputs,
                [device]: {
                  ...(job.outputs[device] || {}),
                  [format]: compressedFile
                }
              }
            };
          }
          );
        });
      })
      .catch(err => {
        console.error("Compression error:", err);
      })
      .finally(() => {
        setProcessorBusy(false);
      });
    
  }, [jobs, processorBusy, compressImage]);


  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      header goes here
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center"> <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Optimize Your Web Images</h2> <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"> Upload your images and get perfectly sized, next-gen formats for every device. Improve your site&apos;s speed and SEO. </p> </div>
          <div className="grid grid-cols-1 gap-8 items-start">
            <div className="space-y-6"> <FileUpload onFilesAdded={handleFilesAdded} /> <DimensionsSettings config={deviceConfig} setConfig={setDeviceConfig} /> </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[200px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Your Files</h3>
                {files.length>0 && <button disabled={!compressImage} onClick={handleCompressClick} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"> Compress All </button>}
                {jobs.filter(isJobFinished).length > 0 && <button onClick={()=>downloadAllFiles(jobs)} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center text-sm"> <Package className="w-4 h-4 mr-2"/> Download All Files </button>}
              </div>
              {jobs.length === 0 ? ( <div className="text-center py-10 text-gray-500"> <p>Upload some files to get started!</p> </div> ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((job,index) => ( <FileItem key={job.id} onRemove={() => handleRemoveJob(index)} onDownloadOne={(device:Device, format:Format)=>downloadResultFile(job, device, format)} onDownloadAll={()=>downloadAllFiles([job])}job={job} /> ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <style>{`.toggle-checkbox:checked { right: 0; border-color: #2563eb; } .toggle-checkbox:checked + .toggle-label { background-color: #2563eb; }`}</style>
    </div>
  );
}