'use client';

import CompressorApp from './compressor-app';
import { FormatSettings } from './format-settings';
import type {
  FormatSettingsDictionary,
  ResultsDictionary,
  UploadDictionary,
} from '@/i18n/type';
import type { CompressionInput } from '@/types/compressor';
import type { FormatConfig } from '@/types/config';
import type { Format } from '@/utils/formats';
import { createFormatJob, formatConfigIsValid } from '@/utils/jobs';

// Format pages (/image/format/, /video/format/): pick the output formats,
// resizing is optional (behind "advanced settings").
export default function FormatCompressorPage({
  compressorType,
  initialConfig,
  availableFormats,
  uploadTranslation,
  formatSettingTranslation,
  formatsTranslation,
  resultTranslation,
}: {
  compressorType: CompressionInput;
  initialConfig: FormatConfig;
  availableFormats: Format[];
  uploadTranslation: UploadDictionary;
  formatSettingTranslation: FormatSettingsDictionary;
  formatsTranslation: Record<Format, string>;
  resultTranslation: ResultsDictionary;
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
        />
      )}
      configIsValid={formatConfigIsValid}
      createJob={(file, config) =>
        createFormatJob(file, config, formatSettingTranslation.converted)
      }
    />
  );
}
