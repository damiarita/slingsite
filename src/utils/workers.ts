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

export function getCompressedFileName(
  orginalName: string,
  device: Device,
  format: Format,
) {
  const fileNamePieces = orginalName.split('.');
  fileNamePieces[fileNamePieces.length - 2] =
    fileNamePieces[fileNamePieces.length - 2] + '-compressed-' + device;
  fileNamePieces[fileNamePieces.length - 1] = format;
  return fileNamePieces.join('.');
}
