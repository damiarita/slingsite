
import { Format } from "./formats";
import { Device } from "./devices";
import { MediaSize } from "./mediaSizes";

export type Job = {
    id: string;
    original: File;
    originalSize: MediaSize;
    requestedSizes: Partial<Record<Device, MediaSize>>;
    requestedFormats: Format[];
    outputs: Partial<Record<Device, Partial<Record<Format, File>>>>;
};