import type { Device } from '@/types/devices';

export function getCompressedFileName(
  orginalName: string,
  device: Device,
  format: string,
) {
  return getFileNameWithExtensionAndSuffix(
    orginalName,
    format,
    `-compressed-${device}`,
  );
}

export function getFileNameWithExtensionAndSuffix(
  originalName: string,
  extension: string,
  suffix?: string,
) {
  const fileNamePieces = originalName.split('.');
  fileNamePieces[fileNamePieces.length - 2] =
    fileNamePieces[fileNamePieces.length - 2] + (suffix || '');
  fileNamePieces[fileNamePieces.length - 1] = extension;
  return fileNamePieces.join('.');
}
