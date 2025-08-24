
import { Format } from "./formats";
import { Device } from "./devices";
import { MediaSize } from "./mediaSizes";

export type Outputs = Partial<Record<Device, Partial<Record<Format, File>>>>;
export type RequestedSizes = Partial<Record<Device, MediaSize>>;
export type RequestedFormats = Format[];
export type Job = {
    id: string;
    original: File;
    requestedSizes: RequestedSizes;
    requestedFormats: RequestedFormats;
    outputs: Outputs;
};