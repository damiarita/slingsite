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
import type { TaskErrorKind } from '@/types/analytics';

self.onmessage = async (ev) => {
  const { jobId, file, formats, mediaSizes, fileNames, mask } =
    ev.data as InputMessage;

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
    fileNames,
    (compressedFile: File, configName: string, format: ImageFormat) => {
      sendResultMessage(jobId, configName, format, compressedFile);
    },
    (
      configName: string,
      format: ImageFormat,
      errorMessage: string,
      errorKind: TaskErrorKind,
    ) => {
      sendErrorMessage(jobId, configName, format, errorMessage, errorKind);
    },
    (configName: string, format: ImageFormat) => {
      sendProgressMessage(jobId, configName, format);
    },
    mask,
  );

  sendReadyMessage();
};

sendReadyMessage();
