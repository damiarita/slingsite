import { Format } from '@/utils/formats';
import { Device } from './devices';

export type Message =
  | {
      type: 'status';
      content: 'ready';
    }
  | {
      type: 'result';
      device: Device;
      format: Format;
      content: File;
    }
  | {
      type: 'progress';
      device: Device;
      format: Format;
      content: number;
    };
