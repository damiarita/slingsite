import type { Format } from '@/utils/formats';
import type { AiModelId } from '@/utils/ai-models';
import type { AiDevice, AiMask } from './ai';
import type { TaskErrorKind } from './analytics';
import type { MediaDimensions } from './mediaDimensions';

export interface InputMessage {
  jobId: string;
  file: File;
  formats: Record<string, Format[]>;
  mediaSizes: Record<string, MediaDimensions>;
  keepAudio: boolean;
  // Output file name per config and format, decided by the job creator.
  fileNames: Record<string, Partial<Record<Format, string>>>;
  // Background removal: the alpha to apply. The image worker only.
  mask?: AiMask;
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
      kind: TaskErrorKind;
    });

export type AiInputMessage =
  | { type: 'load'; modelId: AiModelId }
  | { type: 'cancel' }
  | { type: 'run'; requestId: string; modelId: AiModelId; file: File };

export type AiOutputMessage =
  | { type: 'ready' }
  | { type: 'download'; modelId: AiModelId; percentage: number }
  | {
      type: 'loaded';
      modelId: AiModelId;
      device: AiDevice;
      elapsedMs: number;
    }
  | {
      type: 'load-error';
      modelId: AiModelId;
      message: string;
      kind: TaskErrorKind;
      cancelled: boolean;
    }
  | {
      type: 'mask';
      requestId: string;
      mask: AiMask;
      empty: boolean;
    }
  | { type: 'alt'; requestId: string; text: string }
  | {
      type: 'run-error';
      requestId: string;
      message: string;
      kind: TaskErrorKind;
    };
