'use client';

import {useState, useEffect} from "react"
import { FileUpload } from "@/components/file-upload"
import { Results } from "@/components/results"
import { DimensionsSettings, DimensionsConfig } from "@/components/dimension-settings"
import useCompressImage from "@/hooks/use-compress-image";
import { ImageFormat } from "@/types/formats";
import { Device } from "@/types/devices";
import {Job , Task} from "@/types/job";
import { createImageJob, jobNextPendingTask } from "@/utils/jobs";
import { MediaDimensions } from "@/types/mediaDimensions";

function getJobWithUpdatedTask(jobs:Job[], job:Job, device:Device, format:ImageFormat, newTask:Task){
  return jobs.map(currentJob => {
    if (currentJob.id !== job.id) return currentJob;
    return {
      ...job,
      tasks: {
        ...job.tasks,
        [device]: {
          ...(job.tasks[device] || {}),
          [format]: newTask
        }
      }
    };
  });
}


export default function App() {
  const [mode, setMode] = useState<'upload'|'settings'|'results'>('upload');
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
    setMode('settings');
  }

  const handleRemoveFile = (index:number) => {
    if (files.length === 1) setMode('upload'); // If it was the last file, go back to upload mode
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  }

  const handleCompressClick = () => {
    const requestedDevices = Object.entries(deviceConfig).filter(([, config]) => config.enabled).map(([device]) => device) as Device[];
    Promise.all(files.map(file=>createImageJob(file, requestedDevices, deviceConfig))).then(newJobs=>{
      setJobs(prev => [
        ...prev,
        ...newJobs
      ]);
      setFiles([]);
      setMode('results');
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

    const nextJob = jobs.find((job)=>jobNextPendingTask(job));
    if (!nextJob) return;
    
    const nextPendingTask = jobNextPendingTask(nextJob);
    if(!nextPendingTask) throw new Error("Inconsistent state: job is not finished but has no pending tasks");
    const [device, format] = nextPendingTask;

    if(!compressImage) throw new Error("Compressor function not available");
      
    setProcessorBusy(true);
    setJobs(prevJobs => {
      return getJobWithUpdatedTask(prevJobs, nextJob, device, format as ImageFormat, { status: 'running' });
    });
    compressImage(nextJob.originalFile, format as ImageFormat, nextJob.requestedDimensions[device] as MediaDimensions)
      .then(compressedFile => {
        setJobs(prevJobs => {
          return getJobWithUpdatedTask(prevJobs, nextJob, device, format as ImageFormat, { status: 'completed', result: compressedFile });
        });
      })
      .catch(err => {
        setJobs(prevJobs => {
          return getJobWithUpdatedTask(prevJobs, nextJob, device, format as ImageFormat, { status: 'errored', error: err });
        });
        console.error("Compression error:", err);
      })
      .finally(() => {
        setProcessorBusy(false);
      });
    
  }, [jobs, processorBusy, compressImage]);


  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      SlingSite (Header goes here)
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {mode==='upload' && <div className="text-center"> <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Optimize Your Web Images</h2> <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"> Upload your images and get perfectly sized, next-gen formats for every device. Improve your site&apos;s speed and SEO. </p> </div>}
          <div className="grid grid-cols-1 gap-8 items-start">
            {mode==='upload' && <FileUpload onFilesAdded={handleFilesAdded} />}
            {mode==='settings' && <DimensionsSettings handleReturnToUpload={()=>setMode('upload')} handleRemoveFile={handleRemoveFile} files={files} config={deviceConfig} setConfig={setDeviceConfig} readyToCompress={!!compressImage} handleCompressClick={handleCompressClick}/> }
            {mode==='results' && <Results jobs={jobs} handleRemoveJob={handleRemoveJob} handleGoToUpload={()=>setMode('upload')}/> }
          </div>
        </div>
      </main>
      <style>{`.toggle-checkbox:checked { right: 0; border-color: #2563eb; } .toggle-checkbox:checked + .toggle-label { background-color: #2563eb; }`}</style>
    </div>
  );
}