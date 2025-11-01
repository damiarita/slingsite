'use client';

import {useState, useEffect, useRef} from "react"
import { FileUpload } from "@/components/file-upload"
import { Results } from "@/components/results"
import { DimensionsSettings, DimensionsConfig } from "@/components/dimension-settings"
import useCompressImage from "@/hooks/use-compress-image";
import useCompressVideo from "@/hooks/use-compress-video";
import { Format } from "@/utils/formats";
import { Device } from "@/types/devices";
import {Job , Task} from "@/types/job";
import { createJob, jobNextPendingTask } from "@/utils/jobs";
import { MediaDimensions } from "@/types/mediaDimensions";
import { Locale } from "@/i18n/lib";
import { CompressionInput } from "@/types/compressor";
import { CompressionPageSeoTranslations } from "@/i18n/type";

function getJobWithUpdatedTask(jobs:Job[], job:Job, device:Device, format:Format, newTask:Task){
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


export default function App({compressorType, translation}:{locale:Locale, compressorType:CompressionInput, translation:CompressionPageSeoTranslations}) {
  const [mode, setMode] = useState<'first-upload'|'settings'|'results+upload'>('first-upload');
  const [files, setFiles] = useState<File[]>([]);
  const [processorBusy, setProcessorBusy] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  const uploadRef=useRef<HTMLDivElement>(null);
  const settingsRef=useRef<HTMLDivElement>(null);
  const resultsRef=useRef<HTMLDivElement>(null);

  const [deviceConfig, setDeviceConfig] = useState<DimensionsConfig>({
    mobile: { enabled: true, screenWidth: 450, sizingType: 'percentage', percentage:100, width: 450, height: 100 },
    tablet: { enabled: true, screenWidth: 1050, sizingType: 'percentage', percentage: 50,  width: 525, height: 100 },
    desktop: { enabled: true, screenWidth: 1950, sizingType: 'percentage', percentage: 33.33, width: 650, height: 100 },
  });
  const compressImage = useCompressImage();
  const compressVideo = useCompressVideo();
  const compressFunction = compressorType==='image'?compressImage:compressVideo;

  const handleFilesAdded = (newFiles:File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setMode('settings');
    settingsRef.current?.scrollIntoView({ behavior: 'smooth', block:'start' });
  }

  const handleRemoveFile = (index:number) => {
    if (files.length === 1){
      setMode('results+upload'); // If it was the last file we cannot stay in settings mode
      uploadRef.current?.scrollIntoView({ behavior: 'smooth', block:'start' });
    }
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  }

  const handleCompressClick = () => {
    const requestedDevices = Object.entries(deviceConfig).filter(([, config]) => config.enabled).map(([device]) => device) as Device[];
    Promise.all(files.map(file=>createJob(file, requestedDevices, deviceConfig))).then(newJobs=>{
      setJobs(prev => [
        ...prev,
        ...newJobs
      ]);
      setFiles([]);
      setMode('results+upload');
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block:'start'});
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

    if(!compressFunction) throw new Error("Compressor function not available");
      
    setProcessorBusy(true);
    setJobs(prevJobs => {
      const initialTaskStatus:Task = { status: 'running' };
      if (compressorType==='video'){
        initialTaskStatus.percentage = 0;
      }
      return getJobWithUpdatedTask(prevJobs, nextJob, device, format, initialTaskStatus);
    });
    compressFunction(nextJob.originalFile, format, nextJob.requestedDimensions[device] as MediaDimensions, function(progress:number){
      setJobs(prevJobs => {
        return getJobWithUpdatedTask(prevJobs, nextJob, device, format, { status: 'running', percentage: Math.floor(progress*100) });
      })
    })
      .then(compressedFile => {
        setJobs(prevJobs => {
          return getJobWithUpdatedTask(prevJobs, nextJob, device, format, { status: 'completed', result: compressedFile });
        });
      })
      .catch(err => {
        setJobs(prevJobs => {
          return getJobWithUpdatedTask(prevJobs, nextJob, device, format, { status: 'errored', error: err });
        });
        console.error("Compression error:", err);
      })
      .finally(() => {
        setProcessorBusy(false);
      });
    
  }, [jobs, processorBusy, compressFunction]);


  return (
    <div className="space-y-8">
      {mode==='first-upload' && <div className="text-center"> <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{translation.title}</h2> <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{translation.subtitle}</p> </div>}
      <div className="grid grid-cols-1 gap-8 items-start">
        { (mode==='first-upload'||mode==='results+upload') && <div ref={uploadRef}><FileUpload onFilesAdded={handleFilesAdded} type={compressorType}/></div>}
        {mode==='settings' && <div ref={settingsRef}><DimensionsSettings handleExitSettings={()=>{setMode('results+upload'); uploadRef.current?.scrollIntoView({behavior:'smooth', block:'start'})}} handleRemoveFile={handleRemoveFile} files={files} config={deviceConfig} setConfig={setDeviceConfig} readyToCompress={!!compressFunction} handleCompressClick={handleCompressClick}/></div> }
        {jobs.length>0 && <div ref={resultsRef}><Results jobs={jobs} handleRemoveJob={handleRemoveJob}/></div> }
      </div>
    </div>
  );
}