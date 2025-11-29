import { Device } from '@/types/devices';
import { Message } from '@/types/workers';
import { Format } from './formats';

function sendMessage(message: Message): void {
  self.postMessage(message);
}

export function sendReadyMessage() {
  sendMessage({ type: 'status', content: 'ready' });
}

export function sendProgressMessage(
  device: Device,
  format: Format,
  progress?: number,
) {
  sendMessage({ type: 'progress', device, format, content: progress });
}

export function sendResultMessage(device: Device, format: Format, file: File) {
  sendMessage({ type: 'result', device, format, content: file });
}
