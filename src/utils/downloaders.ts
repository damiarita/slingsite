import { Device } from "@/types/devices";
import { Format } from "@/types/formats";
import { Job } from "@/types/job";

export const downloadResultFile=(job:Job, device:Device, format:Format)=>{
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

export const downloadAllFiles=(jobs:Job[])=>{
  jobs.forEach(job => {
    (Object.entries(job.outputs) as [Device, Partial<Record<Format, File>>][]).forEach(([device, formats]) => {
      (Object.entries(formats) as [Format, File][]).forEach(([format,]) => {
        downloadResultFile(job, device, format);
      });
    });
  });
};