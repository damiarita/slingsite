import type { Format } from '../utils/formats';
import type { Device } from './devices';
import type { MediaDimensions } from './mediaDimensions';

export type Task =
  | { status: 'waiting' }
  | { status: 'running'; percentage?: number }
  | { status: 'completed'; result: File }
  | { status: 'errored'; errorMessage: string };

export type Job = {
  id: string;
  originalFile: File;
  originalFileObjectURL: string;
  originalDimensions: MediaDimensions;
  requestedDimensions: Partial<Record<Device, MediaDimensions>>;
  requestedFormats: Format[];
  tasks: Partial<Record<Device, Partial<Record<Format, Task>>>>;
};
