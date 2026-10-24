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

  const imageFormatsByConfig: Record<string, ImageFormat[]> = {};
  for (const [configName, configFormats] of Object.entries(formats)) {
    const notImageFormats = configFormats.filter(
      (format) => !isImageFormat(format),
    );
    if (notImageFormats.length > 0) {
      console.warn('Non-image formats found:', notImageFormats);
    }
    imageFormatsByConfig[configName] = configFormats.filter(
      isImageFormat,
    ) as ImageFormat[];
  }

  await compressImage(
    file,
    imageFormatsByConfig,
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
