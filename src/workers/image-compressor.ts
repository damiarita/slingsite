import { Device } from '@/types/devices';
import { MediaDimensions } from '@/types/mediaDimensions';
import { ImageFormat } from '@/utils/formats';

import {
  sendReadyMessage,
  sendResultMessage,
  sendProgressMessage,
} from '@/utils/workers';
import { compressImage } from '@/utils/compressor/image';

self.onmessage = async (ev) => {
  const { file, formats, mediaSizes } = ev.data as {
    file: File;
    formats: ImageFormat[];
    mediaSizes: Partial<Record<Device, MediaDimensions>>;
  };

  await compressImage(
    file,
    formats,
    mediaSizes,
    async (compressedFile: File, device: Device, format: ImageFormat) => {
      sendResultMessage(device, format, compressedFile);
    },
    (device: Device, format: ImageFormat) => {
      sendProgressMessage(device, format);
    },
  );

  sendReadyMessage();
};

sendReadyMessage();
