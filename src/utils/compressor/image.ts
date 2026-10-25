import type { MediaDimensions } from '@/types/mediaDimensions';
import { imageFormats } from '@/utils/formats';
import type { ImageFormat } from '@/utils/formats';

import { encode as avif_encode } from '@jsquash/avif';
import { encode as webp_encode } from '@jsquash/webp';
import { encode as jpeg_encode } from '@jsquash/jpeg';

// No PNG encoder: every browser encodes PNG natively.
const wasmEncoders: Partial<
  Record<ImageFormat, (imageData: ImageData) => Promise<ArrayBuffer>>
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
  formatsByConfig: Record<string, ImageFormat[]>,
  mediaSizes: Record<string, MediaDimensions>,
  fileNames: Record<string, Partial<Record<ImageFormat, string>>>,
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
    const formats = formatsByConfig[configName] || [];
    if (formats.length === 0) continue; // Nothing requested for this config.

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
    // JPG has no alpha channel: encoders turn transparent pixels black, so
    // flatten onto white first (PNG/GIF/WEBP/AVIF sources can be transparent).
    let flattenedCanvas: OffscreenCanvas | undefined;
    const getFlattenedCanvas = () => {
      if (flattenedCanvas) return flattenedCanvas;
      flattenedCanvas = new OffscreenCanvas(mediaSize.width, mediaSize.height);
      const flattenedCtx = flattenedCanvas.getContext('2d')!;
      flattenedCtx.fillStyle = '#ffffff';
      flattenedCtx.fillRect(0, 0, mediaSize.width, mediaSize.height);
      flattenedCtx.drawImage(canvas, 0, 0);
      return flattenedCanvas;
    };
    for (const format of formats) {
      const sourceCanvas = format === 'jpg' ? getFlattenedCanvas() : canvas;
      onBegin(configName, format);
      const outputMimeType = getMimeType(format);
      const fileName = fileNames[configName]?.[format] ?? file.name;
      const wasmEncoder = wasmEncoders[format];
      if (nativelySupportedEncoders[format]) {
        const blob = await sourceCanvas.convertToBlob({
          type: outputMimeType,
          quality: 0.8,
        });
        const compressedFile = new File([blob], fileName, {
          type: outputMimeType,
        });
        onSuccess(compressedFile, configName, format);
      } else if (!wasmEncoder) {
        onError(
          configName,
          format,
          `This browser cannot encode ${format.toUpperCase()}.`,
        );
      } else {
        // Use WASM encoder
        const imageData = sourceCanvas
          .getContext('2d')!
          .getImageData(0, 0, mediaSize.width, mediaSize.height);
        const arrayBuffer = await wasmEncoder(imageData);
        const compressedFile = new File([arrayBuffer], fileName, {
          type: outputMimeType,
        });
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
    png: false,
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
