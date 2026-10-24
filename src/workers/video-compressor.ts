import type { InputMessage } from '@/types/workers';
import { compressImage } from '@/utils/compressor/image';
import { compressVideo, extractFirstFrame } from '@/utils/compressor/video';
import {
  ImageFormat,
  isImageFormat,
  isVideoFormat,
  VideoFormat,
} from '@/utils/formats';
import {
  sendErrorMessage,
  sendProgressMessage,
  sendReadyMessage,
  sendResultMessage,
} from '@/utils/workers';

self.addEventListener('message', async (ev) => {
  const { jobId, file, formats, mediaSizes, keepAudio } =
    ev.data as InputMessage;

  const videoFormatsByConfig: Record<string, VideoFormat[]> = {};
  const imageFormatsByConfig: Record<string, ImageFormat[]> = {};
  for (const [configName, configFormats] of Object.entries(formats)) {
    videoFormatsByConfig[configName] = configFormats.filter(
      isVideoFormat,
    ) as VideoFormat[];
    imageFormatsByConfig[configName] = configFormats.filter(
      isImageFormat,
    ) as ImageFormat[];
  }

  const anyImageFormatsRequested = Object.values(imageFormatsByConfig).some(
    (configFormats) => configFormats.length > 0,
  );

  const thumbnail = anyImageFormatsRequested
    ? await extractFirstFrame(file).catch((error) => {
        const errorMessage =
          'Failed to extract thumbnail from video ' +
          file.name +
          ': ' +
          (error.message || String(error));
        console.error(errorMessage);
        for (const [configName, configFormats] of Object.entries(
          imageFormatsByConfig,
        )) {
          for (const format of configFormats) {
            sendErrorMessage(jobId, configName, format, errorMessage);
          }
        }
        return undefined;
      })
    : undefined;

  await compressVideo(
    file,
    videoFormatsByConfig,
    mediaSizes,
    keepAudio,
    (compressedFile: File, configName: string, format: VideoFormat) => {
      sendResultMessage(jobId, configName, format, compressedFile);
    },
    (configName: string, format: VideoFormat, errorMessage: string) => {
      sendErrorMessage(jobId, configName, format, errorMessage);
    },
    (configName: string, format: VideoFormat, progress: number) => {
      sendProgressMessage(jobId, configName, format, progress);
    },
  );

  if (thumbnail) {
    await compressImage(
      thumbnail,
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
  }

  sendReadyMessage();
});

sendReadyMessage();
