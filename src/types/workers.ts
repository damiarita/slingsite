import type { Format } from '@/utils/formats';
import type { MediaDimensions } from './mediaDimensions';

export interface InputMessage {
  jobId: string;
  file: File;
  formats: Record<string, Format[]>;
  mediaSizes: Record<string, MediaDimensions>;
  keepAudio: boolean;
  // Output file name per config and format, decided by the job creator.
  fileNames: Record<string, Partial<Record<Format, string>>>;
}

interface BaseOutputMessage {
  type: string;
}

interface JobOutputMessage extends BaseOutputMessage {
  jobId: string;
  configName: string;
  format: Format;
}

export type OutputMessage =
  | (BaseOutputMessage & {
      type: 'status';
      content: 'ready';
    })
  | (JobOutputMessage & {
      type: 'result';
      content: File;
    })
  | (JobOutputMessage & {
      type: 'progress';
      content?: number;
    })
  | (JobOutputMessage & {
      type: 'error';
      content: string;
    });
