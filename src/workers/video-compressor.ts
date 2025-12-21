import { Device } from '@/types/devices';
import { InputMessage } from '@/types/workers';
import { compressImage } from '@/utils/compressor/image';
import { compressVideo, extractFirstFrame } from '@/utils/compressor/video';
import {
  Format,
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
      for (const device of Object.keys(mediaSizes) as Device[]) {
        sendErrorMessage(jobId, device, format, errorMessage);
      }
    }
  });

  await compressVideo(
    file,
    videFormats,
    mediaSizes,
    (compressedFile: File, device: Device, format: VideoFormat) => {
      sendResultMessage(jobId, device, format, compressedFile);
    },
    (device: Device, format: VideoFormat, errorMessage: string) => {
      sendErrorMessage(jobId, device, format, errorMessage);
    },
    (device: Device, format: VideoFormat, progress: number) => {
      sendProgressMessage(jobId, device, format, progress);
    },
  );

  if (thumbnail) {
    await compressImage(
      thumbnail,
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
  }

  sendReadyMessage();
});

sendReadyMessage();
