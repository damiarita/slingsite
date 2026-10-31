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

// How the formats are named in sentences and table headings (proper names,
// the same in every language).
export const formatNames: Record<Format, string> = {
  jpg: 'JPG',
  webp: 'WebP',
  avif: 'AVIF',
  png: 'PNG',
  'avc.mp4': 'MP4',
  'hevc.mp4': 'HEVC',
  'vp9.webm': 'WebM',
};

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

const inputFormatsByMimeType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
  'image/tiff': 'tiff',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'video/x-matroska': 'mkv',
};

// A short name for the format of an input file (analytics). Falls back to the
// extension, since MOV/MKV often have an empty MIME type.
export function getInputFormat(file: File): string {
  const fromMimeType = inputFormatsByMimeType[file.type];
  if (fromMimeType) return fromMimeType;
  const extension = /\.([a-z0-9]{1,5})$/i.exec(file.name)?.[1];
  return extension?.toLowerCase() ?? 'unknown';
}
