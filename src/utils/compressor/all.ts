import { Device } from '@/types/devices';
import { Format } from '@/utils/formats';

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
