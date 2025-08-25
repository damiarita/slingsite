import { DimensionsConfig } from "@/components/dimension-settings";
import { Device } from "@/types/devices";
import { Format } from "@/types/formats";
import { Job } from "@/types/job";
import { MediaSize } from "@/types/mediaSizes";

export const createImageJob = (file:File, requestedDevices:Device[], deviceConfig:DimensionsConfig):Promise<Job> => {
    return getImageSize(file).then(originalSize=>{
        const requestedSizes:Partial<Record<Device, MediaSize>> = {};
        requestedDevices.forEach(device => {
            const config = deviceConfig[device];
            let width = 0, height = 0;
            if (config.sizingType === 'percentage') { width = Math.round(config.screenWidth * (config.percentage / 100)); height = Math.round(originalSize.height * width / originalSize.width); }
            else if (config.sizingType === 'width') { width = Math.round(config.width); height = Math.round(originalSize.height * width / originalSize.width); }
            else if (config.sizingType === 'height') { height = Math.round(config.height); width = Math.round(originalSize.width * height / originalSize.height); }
            requestedSizes[device] = { width, height };
        });
        const requestedFormats:Format[] = ['jpg', 'webp', 'avif'];
        return {
            id: crypto.randomUUID(),
            original: file,
            originalSize,
            requestedSizes,
            requestedFormats,
            outputs: {}
        };
    });
}

export const jobNumberOfRequestedOutputs=(job:Job):number=>{
    return job.requestedFormats.length * Object.keys(job.requestedSizes).length;
}

export const jobNumberOfDoneOutputs=(job:Job):number=>{
    return Object.values(job.outputs).flatMap(deviceOutputs => Object.values(deviceOutputs || {})).length;
}

export const jobNextPendingOutput=(job:Job):{device:Device,format:Format}|null=>{
    for (const device of Object.keys(job.requestedSizes) as Device[]) {
        for (const format of job.requestedFormats) {
            if (!job.outputs[device] || !job.outputs[device]![format]) {
                return {device, format};
            }
        }
    }
    return null;
}

export const isJobFinished=(job:Job):boolean=>{
    return jobNumberOfDoneOutputs(job)===jobNumberOfRequestedOutputs(job);
}
export const isJobPending=(job:Job):boolean=>{
    return jobNumberOfDoneOutputs(job)===0;
}

export const isJobOngoing=(job:Job):boolean=>{
    return !isJobPending(job) && !isJobFinished(job);
}


function getImageSize(file:File):Promise<MediaSize> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({width: img.width, height: img.height});
    img.onerror = reject;
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}