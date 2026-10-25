export const imageFormats = ['jpg', 'webp', 'avif', 'png'] as const;
export type ImageFormat = (typeof imageFormats)[number];

// The compress pages optimize for the web, so they skip PNG (lossless, and
// much heavier than the other three).
export const webImageFormats = [
  'jpg',
  'webp',
  'avif',
] as const satisfies readonly ImageFormat[];

export const videoFormats = ['avc.mp4', 'hevc.mp4', 'vp9.webm'] as const;
export type VideoFormat = (typeof videoFormats)[number];

export type Format = ImageFormat | VideoFormat;

export function isImageFormat(format: Format) {
  return imageFormats.includes(format as ImageFormat);
}

export function isVideoFormat(format: Format) {
  return videoFormats.includes(format as VideoFormat);
}

// The output that keeps a file in its own format, for the "original format"
// option. Formats we can't write fall back to WebP (images: GIF, BMP…) or
// H.264 MP4 (videos: MOV, MKV…). MOV/MKV often have an empty MIME type, so
// videos are also recognized by extension.
export function getOriginalOutputFormat(file: File): Format {
  switch (file.type) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/avif':
      return 'avif';
  }
  if (file.type.startsWith('image/')) return 'webp';
  if (file.type === 'video/webm' || /\.webm$/i.test(file.name)) {
    return 'vp9.webm';
  }
  return 'avc.mp4';
}
