import type { Format } from '../utils/formats';
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
  requestedDimensions: Record<string, MediaDimensions>;
  requestedFormats: Format[];
  tasks: Record<string, Partial<Record<Format, Task>>>;
};
