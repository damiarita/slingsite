import type { Format } from '@/utils/formats';
import type { MediaDimensions } from './mediaDimensions';

export interface InputMessage {
  jobId: string;
  file: File;
  formats: Record<string, Format[]>;
  mediaSizes: Record<string, MediaDimensions>;
  keepAudio: boolean;
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
