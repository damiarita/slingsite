import type { OutputMessage } from '@/types/workers';
import type { Format } from './formats';

function sendMessage(message: OutputMessage): void {
  self.postMessage(message);
}

export function sendReadyMessage() {
  sendMessage({ type: 'status', content: 'ready' });
}

export function sendProgressMessage(
  jobId: string,
  configName: string,
  format: Format,
  progress?: number,
) {
  sendMessage({
    jobId,
    type: 'progress',
    configName,
    format,
    content: progress,
  });
}

export function sendResultMessage(
  jobId: string,
  configName: string,
  format: Format,
  file: File,
) {
  sendMessage({ jobId, type: 'result', configName, format, content: file });
}

export function sendErrorMessage(
  jobId: string,
  configName: string,
  format: Format,
  error: string,
) {
  sendMessage({ jobId, type: 'error', configName, format, content: error });
}
