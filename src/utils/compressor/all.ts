import { getDevicesDictionary } from '@/i18n/requests';
import { Locale } from '@/i18n/routing';
import type { DimensionsConfig, FormatConfig } from '@/types/config';
import type { Format } from '@/utils/formats';
import { getPresetSizes } from '@/utils/size-presets';

// Output file names end in an ASCII slug ("Hero móvil" → "hero-movil"), safe
// in URLs and on every file system. Scripts without Latin letters (Arabic,
// Chinese) give an empty slug, so callers keep a fallback.
const lettersWithoutMarks: Record<string, string> = {
  ß: 'ss',
  æ: 'ae',
  œ: 'oe',
  ø: 'o',
  đ: 'd',
  ð: 'd',
  ł: 'l',
  þ: 'th',
  ı: 'i',
};
export const toFileSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ßæœøđðłþı]/g, (letter) => lettersWithoutMarks[letter])
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Compress pages: `photo-compressed-mobile.webp`. `fileKey` is already a slug
// (getSizeFileKey).
export function getCompressedFileName(
  orginalName: string,
  fileKey: string,
  format: string,
) {
  return getFileNameWithExtensionAndSuffix(
    orginalName,
    format,
    `-compressed-${fileKey}`,
  );
}

// Format, resize and thumbnail pages: `photo-converted.webp`,
// `photo-resized-2.jpg`, `clip-thumbnail.png`.
export function getToolFileName(
  originalName: string,
  fileKey: string,
  format: string,
) {
  return getFileNameWithExtensionAndSuffix(originalName, format, `-${fileKey}`);
}

export function getFileNameWithExtensionAndSuffix(
  originalName: string,
  extension: string,
  suffix?: string,
) {
  const dot = originalName.lastIndexOf('.');
  const baseName = dot > 0 ? originalName.slice(0, dot) : originalName;
  return `${baseName}${suffix ?? ''}.${extension}`;
}

// The compress pages optimize videos for websites, where they usually play
// muted, so the audio is dropped by default.
export async function getDefaultCompressionConfig(
  locale: Locale,
): Promise<DimensionsConfig> {
  return getDevicesDictionary(locale).then((devicesTranslation) => ({
    keepAudio: false,
    sizes: getPresetSizes('recommended', devicesTranslation),
  }));
}

// Format and thumbnail pages start at the original size with resizing off;
// resize pages start resized, with each file kept in its own format.
export function getDefaultFormatConfig({
  formats,
  versionName,
  resize = false,
  originalFormat = false,
  percentage = 100,
}: {
  formats: Format[];
  versionName: string;
  resize?: boolean;
  originalFormat?: boolean;
  percentage?: number;
}): FormatConfig {
  return {
    formats: [...formats],
    originalFormat,
    keepAudio: true,
    resize,
    versions: [
      {
        name: versionName,
        type: 'percentage',
        value: { percentage, width: 1920, height: 1080 },
      },
    ],
  };
}
