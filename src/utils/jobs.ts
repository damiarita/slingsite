import { DimensionsConfig } from "@/components/dimension-settings";
import { Device } from "@/types/devices";
import { Format } from "@/utils/formats";
import { Job, Task } from "@/types/job";
import { MediaDimensions } from "@/types/mediaDimensions";
import { minDimension } from "./mediaDimensions";

export const createJob = (file:File, requestedDevices:Device[], deviceConfig:DimensionsConfig):Promise<Job> => {
    return getMediumSize(file).then(originalDimensions=>{
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
        const requestedFormats:Format[] = file.type.startsWith("image/")?['jpg', 'webp', 'avif']:["webm", "mp4"];
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



function getMediumSize(file:File):Promise<MediaDimensions> {
    if(file.type.startsWith("image/")){
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const result = {width: img.width, height: img.height};
                URL.revokeObjectURL(img.src)
                resolve(result);
            };
            img.onerror = reject;
            const url = URL.createObjectURL(file);
            img.src = url;
        });
    }
    if(file.type.startsWith("video/")){
        return new Promise((resolve, reject)=>{
            const video = document.createElement("video");
            video.preload = "metadata";
            video.onloadedmetadata = function() {
                const res = {width: video.videoWidth, height: video.videoHeight}
                URL.revokeObjectURL(video.src);
                resolve(res)
            };
            video.onerror = reject;
            video.src = URL.createObjectURL(file);
        });
    }
    throw new Error("unsupported mime type: "+file.type)
}