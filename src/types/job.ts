import type { Format } from '../utils/formats';
import type { TaskErrorKind } from './analytics';
import type { MediaDimensions } from './mediaDimensions';

export type Task =
  | { status: 'waiting' }
  | { status: 'running'; percentage?: number }
  | { status: 'completed'; result: File }
  | { status: 'errored'; errorMessage: string; errorKind: TaskErrorKind };

// Analytics ids that link a job to the file it came from and to the Start
// click that created it.
export type JobIds = {
  fileId: string;
  conversionId: string;
};

export type Job = JobIds & {
  id: string;
  originalFile: File;
  originalFileObjectURL: string;
  originalDimensions: MediaDimensions;
  requestedDimensions: Record<string, MediaDimensions>;
  requestedFormats: Record<string, Format[]>;
  keepAudio: boolean;
  outputFileNames: Record<string, Partial<Record<Format, string>>>;
  taskIds: Record<string, Partial<Record<Format, string>>>;
  tasks: Record<string, Partial<Record<Format, Task>>>;
  // Image compress jobs only: the `sizes` attribute of the <picture> snippet
  // shown once the job is done.
  pictureSizes?: string;
};

// A file picked but not started yet. The id follows it into its job.
export type PendingFile = {
  id: string;
  file: File;
};
