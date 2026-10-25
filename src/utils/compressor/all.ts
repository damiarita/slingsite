import { getDevicesDictionary } from '@/i18n/requests';
import { Locale } from '@/i18n/routing';
import type { DimensionsConfig, FormatConfig } from '@/types/config';
import type { Format } from '@/utils/formats';

export function getCompressedFileName(
  orginalName: string,
  configName: string,
  format: string,
) {
  return getFileNameWithExtensionAndSuffix(
    orginalName,
    format,
    `-compressed-${configName}`,
  );
}

// Format, resize and thumbnail pages: `photo-converted.webp`,
// `photo-resized-2.jpg`, `clip-thumbnail.png`.
export function getToolFileName(
  originalName: string,
  configName: string,
  format: string,
) {
  return getFileNameWithExtensionAndSuffix(
    originalName,
    format,
    '-' + configName.trim().toLowerCase().replace(/\s+/g, '-'),
  );
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
    sizes: {
      [devicesTranslation.mobile]: {
        enabled: true,
        screenWidth: 450,
        sizingType: 'percentage',
        percentage: 100,
        width: 450,
        height: 100,
        iconType: 'mobile',
      },
      [devicesTranslation.tablet]: {
        enabled: true,
        screenWidth: 1050,
        sizingType: 'percentage',
        percentage: 50,
        width: 525,
        height: 100,
        iconType: 'tablet',
      },
      [devicesTranslation.desktop]: {
        enabled: true,
        screenWidth: 1950,
        sizingType: 'percentage',
        percentage: 33.33,
        width: 650,
        height: 100,
        iconType: 'desktop',
      },
    },
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
