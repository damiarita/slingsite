import { DimensionsConfig } from "@/components/dimension-settings";
import { Device } from "@/types/devices";
import { Format } from "@/types/formats";
import { Job, Task } from "@/types/job";
import { MediaDimensions } from "@/types/mediaDimensions";
import { minDimension } from "./mediaDimensions";

export const createImageJob = (file:File, requestedDevices:Device[], deviceConfig:DimensionsConfig):Promise<Job> => {
    return getImageSize(file).then(originalDimensions=>{
        const requestedDimensions:Partial<Record<Device, MediaDimensions>> = {};
        requestedDevices.forEach(device => {
            const config = deviceConfig[device];
            let requestedDimension:MediaDimensions;
            if(config.sizingType==='height'){
                requestedDimension={height:config.height, width:originalDimensions.width * config.height / originalDimensions.height};
            } else {
                let width:number;
                if (config.sizingType === 'percentage') width=config.screenWidth * (config.percentage / 100);
                else if (config.sizingType === 'width') width=config.width;
                else throw new Error("Invalid sizing type");
                requestedDimension = { width: width, height:originalDimensions.height * width / originalDimensions.width};
            }
            requestedDimension.width = Math.round(requestedDimension.width);
            requestedDimension.height = Math.round(requestedDimension.height);
            requestedDimensions[device] = minDimension(originalDimensions, requestedDimension);
        });
        const requestedFormats:Format[] = ['jpg', 'webp', 'avif'];
        const tasks:Partial<Record<Device, Partial<Record<Format, Task>>>> = {};
        requestedDevices.forEach(device => { 
            requestedFormats.forEach(format => {
                if (!tasks[device]) tasks[device] = {};
                tasks[device][format] = { status: 'waiting' };
            });
         });

        return {
            id: crypto.randomUUID(),
            originalFile: file,
            originalDimensions,
            requestedDimensions,
            requestedFormats,
            tasks,
        };
    });
}


export const jobNextPendingTask=(job:Job):[Device, Format]|undefined=>{
    for (const [device, formats] of Object.entries(job.tasks) as [Device, Partial<Record<Format, Task>>][]) {
        for (const [format, task] of Object.entries(formats) as [Format, Task][]) {
            if (task.status === 'waiting') {
                return [device, format];
            }
        }
    }
}

const jobTasksAsArray=(job:Job):Task[]=>{
    return Object.values(job.tasks).flatMap(deviceTasks => Object.values(deviceTasks));
}

export const jobIsRunning=(job:Job):boolean=>{
    return jobTasksAsArray(job).some(task=>task.status==='running');
}

export const jobProportionOfDoneTasks=(job:Job):number=>{
    const tasksAsArray = jobTasksAsArray(job);
    const total = tasksAsArray.length;
    if (total===0) return 1;
    const done = tasksAsArray.filter(task=>task.status==='completed' || task.status==='errored').length;
    if (done>=total) return 1;
    return done/total;
}



function getImageSize(file:File):Promise<MediaDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({width: img.width, height: img.height});
    img.onerror = reject;
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}