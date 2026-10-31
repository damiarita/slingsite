'use client';

import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import CompressorApp, { type ConfigProblem } from './compressor-app';
import { DimensionsSettings } from './dimension-settings';
import type {
  AudioSettingsDictionary,
  CompressorAppDictionary,
  ResultsDictionary,
  SettingsDictionary,
  UploadDictionary,
} from '@/i18n/type';
import type { CompressionInput } from '@/types/compressor';
import type { DimensionsConfig } from '@/types/config';
import { createDimensionsJob, getSizesProblem } from '@/utils/jobs';
import { formatNames, videoFormats, webImageFormats } from '@/utils/formats';
import type { DeviceNames } from '@/utils/size-presets';
import { fill, formatCount, formatList } from '@/utils/i18n-format';

// Compress pages (/image/, /video/): one output per screen size.
export default function DimensionsCompressorPage({
  compressorType,
  initialConfig,
  intro,
  deviceNames,
  appTranslation,
  uploadTranslation,
  settingTranslation,
  resultTranslation,
  audioTranslation,
}: {
  compressorType: CompressionInput;
  initialConfig: DimensionsConfig;
  intro: ReactNode;
  deviceNames: DeviceNames;
  appTranslation: CompressorAppDictionary;
  uploadTranslation: UploadDictionary;
  settingTranslation: SettingsDictionary;
  resultTranslation: ResultsDictionary;
  // Videos only: shows the audio toggle.
  audioTranslation?: AudioSettingsDictionary;
}) {
  const locale = useLocale();
  const t = settingTranslation;
  const { counts } = appTranslation;

  const getConfigProblem = (config: DimensionsConfig): ConfigProblem | null => {
    const problem = getSizesProblem(config.sizes);
    if (!problem) return null;
    switch (problem.kind) {
      case 'noSizes':
        return { message: t.problems.noSizes, fieldId: 'size-add' };
      case 'noName':
        return {
          message: t.problems.noName,
          fieldId: `size-name-${problem.id}`,
        };
      case 'duplicateName':
        return {
          message: fill(t.problems.duplicateName, { name: problem.name }),
          fieldId: `size-name-${problem.id}`,
        };
      case 'duplicateFileName':
        return {
          message: fill(t.problems.duplicateFileName, {
            name: problem.name,
            other: problem.other,
          }),
          fieldId: `size-name-${problem.id}`,
        };
      case 'screenWidth':
        return {
          message: t.problems.screenWidth,
          fieldId: `size-screen-${problem.id}`,
        };
      case 'exactSize':
        return {
          message: t.problems.exactSize,
          fieldId: `size-px-${problem.id}`,
        };
    }
  };

  // "2 images, 3 sizes each, in JPG, WebP and AVIF: 18 files"
  const describe = (config: DimensionsConfig, files: File[]) => {
    const mediaCount = formatCount(
      locale,
      files.length,
      compressorType === 'video' ? counts.video : counts.image,
    );
    const imageNames = webImageFormats.map((format) => formatNames[format]);
    const formats =
      compressorType === 'video'
        ? fill(t.withPoster, {
            formats: formatList(
              locale,
              videoFormats.map((format) => formatNames[format]),
            ),
            posterFormats: formatList(locale, imageNames),
          })
        : formatList(locale, imageNames);
    const formatCountPerSize =
      webImageFormats.length +
      (compressorType === 'video' ? videoFormats.length : 0);
    return {
      summary: fill(t.summary, {
        files: mediaCount,
        sizes: formatCount(locale, config.sizes.length, counts.size),
        formats,
        total: formatCount(
          locale,
          files.length * config.sizes.length * formatCountPerSize,
          counts.file,
        ),
      }),
      start: fill(t.start, { files: mediaCount }),
    };
  };

  return (
    <CompressorApp<DimensionsConfig>
      compressorType={compressorType}
      initialConfig={initialConfig}
      intro={intro}
      stepTitle={t.stepTitle}
      samples={compressorType === 'image'}
      translation={appTranslation}
      uploadTranslation={uploadTranslation}
      resultTranslation={resultTranslation}
      renderSettings={(props) => (
        <DimensionsSettings
          {...props}
          deviceNames={deviceNames}
          translation={t}
          audio={
            audioTranslation && {
              defaultKeepAudio: initialConfig.keepAudio,
              translation: audioTranslation,
            }
          }
        />
      )}
      getConfigProblem={getConfigProblem}
      describe={describe}
      createJob={createDimensionsJob}
      describeConfig={(config) => ({
        resize: true,
        keep_audio: compressorType === 'video' ? config.keepAudio : undefined,
        original_format: false,
      })}
    />
  );
}
