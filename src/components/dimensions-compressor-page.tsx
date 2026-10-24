'use client';

import CompressorApp from './compressor-app';
import { DimensionsSettings } from './dimension-settings';
import type {
  ResultsDictionary,
  SettingsDictionary,
  UploadDictionary,
} from '@/i18n/type';
import type { CompressionInput } from '@/types/compressor';
import type { SizingConfigs } from '@/types/config';
import { createDimensionsJob, dimensionsConfigIsValid } from '@/utils/jobs';

// Compress pages (/image/, /video/): one output per device size.
export default function DimensionsCompressorPage({
  compressorType,
  initialConfig,
  uploadTranslation,
  settingTranslation,
  resultTranslation,
}: {
  compressorType: CompressionInput;
  initialConfig: SizingConfigs;
  uploadTranslation: UploadDictionary;
  settingTranslation: SettingsDictionary;
  resultTranslation: ResultsDictionary;
}) {
  return (
    <CompressorApp<SizingConfigs>
      compressorType={compressorType}
      initialConfig={initialConfig}
      translation={{
        filesTitle: settingTranslation.filesToCompress,
        addMoreFiles: settingTranslation.addMoreFiles,
        removeFile: settingTranslation.removeFile,
        start: settingTranslation.startCompression,
      }}
      uploadTranslation={uploadTranslation}
      resultTranslation={resultTranslation}
      renderSettings={(props) => (
        <DimensionsSettings {...props} translation={settingTranslation} />
      )}
      configIsValid={dimensionsConfigIsValid}
      createJob={createDimensionsJob}
    />
  );
}
