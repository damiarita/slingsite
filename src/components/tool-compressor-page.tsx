'use client';

import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import CompressorApp, { type ConfigProblem } from './compressor-app';
import {
  FormatSettings,
  getFormatPickerFieldId,
  getVersionFieldId,
} from './format-settings';
import type {
  AudioSettingsDictionary,
  CompressorAppDictionary,
  FormatSettingsDictionary,
  ResultsDictionary,
  UploadDictionary,
} from '@/i18n/type';
import type { CompressionInput } from '@/types/compressor';
import type { FormatConfig } from '@/types/config';
import {
  type Format,
  formatNames,
  getOriginalOutputFormat,
} from '@/utils/formats';
import {
  createFormatJob,
  getFormatConfigProblem,
  type ToolOutputNames,
} from '@/utils/jobs';
import type { Tool } from '@/utils/tool-pages';
import { fill, formatCount, formatList } from '@/utils/i18n-format';

// Format, resize and thumbnail pages. They share the config and the app; only
// which section comes first, the wording and the output names change.
export default function ToolCompressorPage({
  tool,
  compressorType,
  initialConfig,
  availableFormats,
  intro,
  samples,
  appTranslation,
  uploadTranslation,
  formatSettingTranslation,
  formatsTranslation,
  resultTranslation,
  audioTranslation,
}: {
  tool: Tool;
  compressorType: CompressionInput;
  initialConfig: FormatConfig;
  availableFormats: Format[];
  intro: ReactNode;
  samples?: boolean;
  appTranslation: CompressorAppDictionary;
  uploadTranslation: UploadDictionary;
  formatSettingTranslation: FormatSettingsDictionary;
  formatsTranslation: Record<Format, string>;
  resultTranslation: ResultsDictionary;
  // Videos only (not thumbnails): shows the audio toggle.
  audioTranslation?: AudioSettingsDictionary;
}) {
  const locale = useLocale();
  const t = formatSettingTranslation;
  const { counts } = appTranslation;
  const showOriginalFormat = tool === 'resize';
  // `names`: the outputs' translated names and their (English) file keys.
  const shell: Record<
    Tool,
    { stepTitle: string; start: string; names: ToolOutputNames }
  > = {
    format: {
      stepTitle: t.stepFormats,
      start: t.startConversion,
      names: {
        unresized: { name: t.converted, fileKey: 'converted' },
        version: { name: t.resized, fileKey: 'resized' },
      },
    },
    resize: {
      stepTitle: t.stepSizes,
      start: t.startResize,
      names: {
        unresized: { name: t.resized, fileKey: 'resized' },
        version: { name: t.resized, fileKey: 'resized' },
      },
    },
    thumbnail: {
      stepTitle: t.stepFormats,
      start: t.startThumbnail,
      names: {
        unresized: { name: t.thumbnail, fileKey: 'thumbnail' },
        version: { name: t.thumbnail, fileKey: 'thumbnail' },
      },
    },
  };
  const { stepTitle, start, names } = shell[tool];

  const getConfigProblem = (config: FormatConfig): ConfigProblem | null => {
    const problem = getFormatConfigProblem(config);
    if (!problem) return null;
    switch (problem.kind) {
      case 'noFormat':
        return {
          message: t.problems.noFormat,
          fieldId: getFormatPickerFieldId(availableFormats, showOriginalFormat),
        };
      case 'sizeValue':
        return {
          message: t.problems.sizeValue,
          fieldId: getVersionFieldId(problem.index),
        };
    }
  };

  // "3 images in WebP and AVIF: 6 files". With "original format", each file
  // adds its own format unless it is already picked.
  const describe = (config: FormatConfig, files: File[]) => {
    const mediaCount = formatCount(
      locale,
      files.length,
      compressorType === 'video' ? counts.video : counts.image,
    );
    const versions = config.resize ? config.versions.length : 1;
    const total = files.reduce(
      (sum, file) =>
        sum +
        versions *
          new Set([
            ...config.formats,
            ...(config.originalFormat ? [getOriginalOutputFormat(file)] : []),
          ]).size,
      0,
    );
    const formats = formatList(locale, [
      ...(config.originalFormat ? [t.ownFormat] : []),
      ...config.formats.map((format) => formatNames[format]),
    ]);
    const values = {
      files: mediaCount,
      sizes: formatCount(locale, versions, counts.size),
      formats,
      total: formatCount(locale, total, counts.file),
    };
    return {
      summary:
        total === 0
          ? ''
          : fill(config.resize ? t.summarySizes : t.summary, values),
      start: fill(start, { files: mediaCount }),
    };
  };

  return (
    <CompressorApp<FormatConfig>
      compressorType={compressorType}
      initialConfig={initialConfig}
      intro={intro}
      stepTitle={stepTitle}
      samples={samples}
      translation={appTranslation}
      uploadTranslation={uploadTranslation}
      resultTranslation={resultTranslation}
      renderSettings={(props) => (
        <FormatSettings
          {...props}
          primary={tool === 'resize' ? 'resize' : 'formats'}
          initialConfig={initialConfig}
          versionName={names.version.name}
          availableFormats={availableFormats}
          showOriginalFormat={showOriginalFormat}
          translation={t}
          formatsTranslation={formatsTranslation}
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
      createJob={(file, config, ids) =>
        createFormatJob(file, config, names, ids)
      }
      describeConfig={(config) => ({
        resize: config.resize,
        // Thumbnails have no audio, and images ignore it.
        keep_audio: audioTranslation ? config.keepAudio : undefined,
        original_format: config.originalFormat,
      })}
    />
  );
}
