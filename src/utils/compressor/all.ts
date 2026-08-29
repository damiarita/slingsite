import { getDevicesDictionary } from '@/i18n/requests';
import { Locale } from '@/i18n/routing';
import { SizingConfigs } from '@/types/config';

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

export function getFileNameWithExtensionAndSuffix(
  originalName: string,
  extension: string,
  suffix?: string,
) {
  const fileNamePieces = originalName.split('.');
  fileNamePieces[fileNamePieces.length - 2] =
    fileNamePieces[fileNamePieces.length - 2] + (suffix || '');
  fileNamePieces[fileNamePieces.length - 1] = extension;
  return fileNamePieces.join('.');
}

export async function getDefaultCompressionConfig(
  locale: Locale,
): Promise<SizingConfigs> {
  return getDevicesDictionary(locale).then((devicesTranslation) => ({
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
      icon: 'desktop',
    },
  }));
}
