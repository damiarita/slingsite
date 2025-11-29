import { Device } from '@/types/devices';
import { MediaDimensions } from '@/types/mediaDimensions';
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
  sendProgressMessage,
  sendReadyMessage,
  sendResultMessage,
} from '@/utils/workers';

self.addEventListener('message', async (ev) => {
  const { file, formats, mediaSizes } = ev.data as {
    file: File;
    formats: Format[];
    mediaSizes: Partial<Record<Device, MediaDimensions>>;
  };

  const videFormats = formats.filter(isVideoFormat) as VideoFormat[];
  const imageFormats = formats.filter(isImageFormat) as ImageFormat[];

  const thumbnail = await extractFirstFrame(file);

  await compressVideo(
    file,
    videFormats,
    mediaSizes,
    async (compressedFile: File, device: Device, format: VideoFormat) => {
      sendResultMessage(device, format, compressedFile);
    },
    (device: Device, format: VideoFormat, progress: number) => {
      sendProgressMessage(device, format, progress);
    },
  );

  await compressImage(
    thumbnail,
    imageFormats,
    mediaSizes,
    async (compressedFile: File, device: Device, format: ImageFormat) => {
      sendResultMessage(device, format, compressedFile);
    },
    (device: Device, format: ImageFormat) => {
      sendProgressMessage(device, format);
    },
  );

  sendReadyMessage();
});

sendReadyMessage();
