import { Device } from '@/types/devices';
import { MediaDimensions } from '@/types/mediaDimensions';
import { ImageFormat, imageFormats } from '@/utils/formats';

import { encode as avif_encode } from '@jsquash/avif';
import { encode as webp_encode } from '@jsquash/webp';
import { encode as jpeg_encode } from '@jsquash/jpeg';
import { getCompressedFileName } from '@/utils/compressor/all';

const wasmEncoders: Record<
  ImageFormat,
  (imageData: ImageData) => Promise<ArrayBuffer>
> = {
  avif: async (imageData: ImageData) => {
    return avif_encode(imageData);
  },
  webp: async (imageData: ImageData) => {
    return webp_encode(imageData);
  },
  jpg: async (imageData: ImageData) => {
    return jpeg_encode(imageData);
  },
};

const nativelySupportedEncoders = await calculateSupportedEncoders();

export async function compressImage(
  file: File,
  formats: ImageFormat[],
  mediaSizes: Partial<Record<Device, MediaDimensions>>,
  onSuccess: (file: File, device: Device, format: ImageFormat) => void,
  onBegin: ((device: Device, format: ImageFormat) => void) | undefined,
): Promise<void> {
  const imageBitmap = await createImageBitmap(file);

  for (const [device, mediaSize] of Object.entries(mediaSizes) as [
    Device,
    MediaDimensions,
  ][]) {
    // Create canvas for resizing
    const canvas = new OffscreenCanvas(mediaSize.width, mediaSize.height);
    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true, // Hint for hardware acceleration
    });
    if (!ctx) throw new Error('Failed to get canvas context');

    // Use high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw resized image
    ctx.drawImage(imageBitmap, 0, 0, mediaSize.width, mediaSize.height);
    for (const format of formats) {
      if (onBegin) onBegin(device, format);
      const outputMimeType = getMimeType(format);
      if (nativelySupportedEncoders[format]) {
        const blob = await canvas.convertToBlob({
          type: outputMimeType,
          quality: 0.8,
        });
        const compressedFile = new File(
          [blob],
          getCompressedFileName(file.name, device, format),
          { type: outputMimeType },
        );
        onSuccess(compressedFile, device, format);
      } else {
        // Use WASM encoder
        const imageData = ctx.getImageData(
          0,
          0,
          mediaSize.width,
          mediaSize.height,
        );
        const arrayBuffer = await wasmEncoders[format](imageData);
        const compressedFile = new File(
          [arrayBuffer],
          getCompressedFileName(file.name, device, format),
          {
            type: outputMimeType,
          },
        );
        onSuccess(compressedFile, device, format);
      }
    }
  }
}

async function calculateSupportedEncoders(): Promise<
  Record<ImageFormat, boolean>
> {
  const testCanvas = new OffscreenCanvas(1, 1);
  const ctx = testCanvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get test canvas context');

  // Fill with a simple color
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 1, 1);

  const result: Record<ImageFormat, boolean> = {
    jpg: false,
    webp: false,
    avif: false,
  };

  for (const format of imageFormats) {
    try {
      const mimeType = getMimeType(format);
      const blob = await testCanvas.convertToBlob({ type: mimeType });
      result[format] = blob.type === mimeType;
    } catch {
      result[format] = false;
    }
  }

  return result;
}

function getMimeType(format: ImageFormat): string {
  return format === 'jpg' ? 'image/jpeg' : `image/${format}`;
}
