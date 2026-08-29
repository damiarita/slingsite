import { isImageFormat } from '@/utils/formats';
import type { ImageFormat } from '@/utils/formats';

import {
  sendReadyMessage,
  sendResultMessage,
  sendProgressMessage,
  sendErrorMessage,
} from '@/utils/workers';
import { compressImage } from '@/utils/compressor/image';
import type { InputMessage } from '@/types/workers';

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
    (compressedFile: File, configName: string, format: ImageFormat) => {
      sendResultMessage(jobId, configName, format, compressedFile);
    },
    (configName: string, format: ImageFormat, errorMessage: string) => {
      sendErrorMessage(jobId, configName, format, errorMessage);
    },
    (configName: string, format: ImageFormat) => {
      sendProgressMessage(jobId, configName, format);
    },
  );

  sendReadyMessage();
};

sendReadyMessage();
