import { Device } from '@/types/devices';
import { MediaDimensions } from '@/types/mediaDimensions';
import { ImageFormat, isImageFormat } from '@/utils/formats';

import {
  sendReadyMessage,
  sendResultMessage,
  sendProgressMessage,
  sendErrorMessage,
} from '@/utils/workers';
import { compressImage } from '@/utils/compressor/image';
import { InputMessage } from '@/types/workers';

self.onmessage = async (ev) => {
  const { jobId, file, formats, mediaSizes } = ev.data as InputMessage;

  const notImageFormats = formats.filter((format) => !isImageFormat(format));
  const imageFormats = formats.filter(isImageFormat) as ImageFormat[];

  if (notImageFormats.length > 0) {
    console.warn('Non-image formats found:', notImageFormats);
  }

  await compressImage(
    file,
    imageFormats,
    mediaSizes,
    (compressedFile: File, device: Device, format: ImageFormat) => {
      sendResultMessage(jobId, device, format, compressedFile);
    },
    (device: Device, format: ImageFormat, errorMessage: string) => {
      sendErrorMessage(jobId, device, format, errorMessage);
    },
    (device: Device, format: ImageFormat) => {
      sendProgressMessage(jobId, device, format);
    },
  );

  sendReadyMessage();
};

sendReadyMessage();
