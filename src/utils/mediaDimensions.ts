import { MediaDimensions } from '@/types/mediaDimensions';

export const minDimension = (
  dimension1: MediaDimensions,
  dimension2: MediaDimensions,
): MediaDimensions => {
  if (
    dimension1.width <= dimension2.width &&
    dimension1.height <= dimension2.height
  )
    return dimension1;
  if (
    dimension2.width <= dimension1.width &&
    dimension2.height <= dimension1.height
  )
    return dimension2;
  throw new Error('Dimensions are not comparable');
};

// Both keep the aspect ratio and never upscale.
export const scaleToWidth = (
  original: MediaDimensions,
  width: number,
): MediaDimensions =>
  minDimension(original, {
    width: Math.round(width),
    height: Math.round((original.height * width) / original.width),
  });

export const scaleToHeight = (
  original: MediaDimensions,
  height: number,
): MediaDimensions =>
  minDimension(original, {
    width: Math.round((original.width * height) / original.height),
    height: Math.round(height),
  });

export function getMediumSize(file: File): Promise<MediaDimensions> {
  if (file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const result = { width: img.width, height: img.height };
        URL.revokeObjectURL(img.src);
        resolve(result);
      };
      img.onerror = reject;
      const url = URL.createObjectURL(file);
      img.src = url;
    });
  }
  if (file.type.startsWith('video/')) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function () {
        const res = { width: video.videoWidth, height: video.videoHeight };
        URL.revokeObjectURL(video.src);
        resolve(res);
      };
      video.onerror = function (e) {
        reject(e);
      };
      video.src = URL.createObjectURL(file);
    });
  }
  throw new Error('unsupported mime type: ' + file.type);
}
