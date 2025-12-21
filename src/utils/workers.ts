import { Device } from '@/types/devices';
import { OutputMessage } from '@/types/workers';
import { Format } from './formats';

function sendMessage(message: OutputMessage): void {
  self.postMessage(message);
}

export function sendReadyMessage() {
  sendMessage({ type: 'status', content: 'ready' });
}

export function sendProgressMessage(
  jobId: string,
  device: Device,
  format: Format,
  progress?: number,
) {
  sendMessage({ jobId, type: 'progress', device, format, content: progress });
}

export function sendResultMessage(
  jobId: string,
  device: Device,
  format: Format,
  file: File,
) {
  sendMessage({ jobId, type: 'result', device, format, content: file });
}

export function sendErrorMessage(
  jobId: string,
  device: Device,
  format: Format,
  error: string,
) {
  sendMessage({ jobId, type: 'error', device, format, content: error });
}
