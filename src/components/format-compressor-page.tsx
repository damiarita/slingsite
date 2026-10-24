'use client';

import CompressorApp from './compressor-app';
import { FormatSettings } from './format-settings';
import type {
  AudioSettingsDictionary,
  FormatSettingsDictionary,
  ResultsDictionary,
  UploadDictionary,
} from '@/i18n/type';
import type { CompressionInput } from '@/types/compressor';
import type { FormatConfig } from '@/types/config';
import type { Format } from '@/utils/formats';
import { createFormatJob, formatConfigIsValid } from '@/utils/jobs';

// Format pages (/image/format/, /video/format/): pick the output formats,
// resizing (and audio, for videos) is optional, behind "advanced settings".
export default function FormatCompressorPage({
  compressorType,
  initialConfig,
  availableFormats,
  uploadTranslation,
  formatSettingTranslation,
  formatsTranslation,
  resultTranslation,
  audioTranslation,
}: {
  compressorType: CompressionInput;
  initialConfig: FormatConfig;
  availableFormats: Format[];
  uploadTranslation: UploadDictionary;
  formatSettingTranslation: FormatSettingsDictionary;
  formatsTranslation: Record<Format, string>;
  resultTranslation: ResultsDictionary;
  // Videos only: shows the audio toggle.
  audioTranslation?: AudioSettingsDictionary;
}) {
  return (
    <CompressorApp<FormatConfig>
      compressorType={compressorType}
      initialConfig={initialConfig}
      translation={{
        filesTitle: formatSettingTranslation.filesToConvert,
        addMoreFiles: formatSettingTranslation.addMoreFiles,
        removeFile: formatSettingTranslation.removeFile,
        start: formatSettingTranslation.startConversion,
      }}
      uploadTranslation={uploadTranslation}
      resultTranslation={resultTranslation}
      renderSettings={(props) => (
        <FormatSettings
          {...props}
          availableFormats={availableFormats}
          translation={formatSettingTranslation}
          formatsTranslation={formatsTranslation}
          audio={
            audioTranslation && {
              defaultKeepAudio: initialConfig.keepAudio,
              translation: audioTranslation,
            }
          }
        />
      )}
      configIsValid={formatConfigIsValid}
      createJob={(file, config) =>
        createFormatJob(file, config, formatSettingTranslation.converted)
      }
    />
  );
}
