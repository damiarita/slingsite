import { Device } from "@/types/devices";
import { Format } from "@/types/formats";
import { Job, Task } from "@/types/job";

export const downloadResultFile=(job:Job, device:Device, format:Format)=>{
  const task = job.tasks[device]?.[format];
  if (task && task.status==='completed') {
    const url = URL.createObjectURL(task.result);
    const a = document.createElement('a');
    a.href = url;
    a.download = getDownloadName(task.result.name, device, format);
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
    (Object.entries(job.tasks) as [Device, Partial<Record<Format, Task>>][]).forEach(([device, formats]) => {
      (Object.entries(formats) as [Format, Task][]).forEach(([format]) => {
        downloadResultFile(job, device, format);
      });
    });
  });
};