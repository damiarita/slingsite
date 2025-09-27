
import { Format } from "../utils/formats";
import { Device } from "./devices";
import { MediaDimensions } from "./mediaDimensions";

export type Task =
    { status: 'waiting' }
  | { status: 'running' }
  | { status: 'completed'; result: File }
  | { status: 'errored'; error: Error };

export type Job = {
    id: string;
    originalFile: File;
    originalDimensions: MediaDimensions;
    requestedDimensions: Partial<Record<Device, MediaDimensions>>;
    requestedFormats: Format[];
    tasks: Partial<Record<Device, Partial<Record<Format, Task>>>>;
};