import { Format } from '@/utils/formats';
import { Device } from './devices';
import { MediaDimensions } from './mediaDimensions';

export interface InputMessage {
  jobId: string;
  file: File;
  formats: Format[];
  mediaSizes: Partial<Record<Device, MediaDimensions>>;
}

interface BaseOutputMessage {
  type: string;
}

interface JobOutputMessage extends BaseOutputMessage {
  jobId: string;
  device: Device;
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
