import type { MediaDimensions } from '@/types/mediaDimensions';
import { imageFormats } from '@/utils/formats';
import type { ImageFormat } from '@/utils/formats';

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

const nativelySupportedEncodersPromise: Promise<Record<ImageFormat, boolean>> =
  calculateSupportedEncoders();

export async function compressImage(
  file: File,
  formats: ImageFormat[],
  mediaSizes: Record<string, MediaDimensions>,
  onSuccess: (file: File, configName: string, format: ImageFormat) => void,
  onError: (
    configName: string,
    format: ImageFormat,
    errorMessage: string,
  ) => void,
  onBegin: (configName: string, format: ImageFormat) => void,
): Promise<void> {
  const nativelySupportedEncoders = await nativelySupportedEncodersPromise;
  const imageBitmap = await createImageBitmap(file);

  for (const [configName, mediaSize] of Object.entries(mediaSizes)) {
    // Create canvas for resizing
    const canvas = new OffscreenCanvas(mediaSize.width, mediaSize.height);
    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true, // Hint for hardware acceleration
    });
    if (!ctx) {
      for (const format of formats) {
        onError(configName, format, 'Failed to get canvas context');
      }
      continue;
    }
    // Use high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw resized image
    ctx.drawImage(imageBitmap, 0, 0, mediaSize.width, mediaSize.height);
    for (const format of formats) {
      onBegin(configName, format);
      const outputMimeType = getMimeType(format);
      if (nativelySupportedEncoders[format]) {
        const blob = await canvas.convertToBlob({
          type: outputMimeType,
          quality: 0.8,
        });
        const compressedFile = new File(
          [blob],
          getCompressedFileName(file.name, configName, format),
          { type: outputMimeType },
        );
        onSuccess(compressedFile, configName, format);
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
          getCompressedFileName(file.name, configName, format),
          {
            type: outputMimeType,
          },
        );
        onSuccess(compressedFile, configName, format);
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
