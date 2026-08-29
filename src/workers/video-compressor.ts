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
  const { jobId, file, formats, mediaSizes } = ev.data as InputMessage;

  const videFormats = formats.filter(isVideoFormat) as VideoFormat[];
  const imageFormats = formats.filter(isImageFormat) as ImageFormat[];

  const thumbnail = await extractFirstFrame(file).catch((error) => {
    const errorMessage =
      'Failed to extract thumbnail from video ' +
      file.name +
      ': ' +
      (error.message || String(error));
    console.error(errorMessage);
    for (const format of imageFormats) {
      for (const configName of Object.keys(mediaSizes)) {
        sendErrorMessage(jobId, configName, format, errorMessage);
      }
    }
  });

  await compressVideo(
    file,
    videFormats,
    mediaSizes,
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
  }

  sendReadyMessage();
});

sendReadyMessage();
