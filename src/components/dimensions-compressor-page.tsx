'use client';

import CompressorApp from './compressor-app';
import { DimensionsSettings } from './dimension-settings';
import type {
  AudioSettingsDictionary,
  ResultsDictionary,
  SettingsDictionary,
  UploadDictionary,
} from '@/i18n/type';
import type { CompressionInput } from '@/types/compressor';
import type { DimensionsConfig } from '@/types/config';
import { createDimensionsJob, dimensionsConfigIsValid } from '@/utils/jobs';

// Compress pages (/image/, /video/): one output per device size.
export default function DimensionsCompressorPage({
  compressorType,
  initialConfig,
  uploadTranslation,
  settingTranslation,
  resultTranslation,
  audioTranslation,
}: {
  compressorType: CompressionInput;
  initialConfig: DimensionsConfig;
  uploadTranslation: UploadDictionary;
  settingTranslation: SettingsDictionary;
  resultTranslation: ResultsDictionary;
  // Videos only: shows the audio toggle.
  audioTranslation?: AudioSettingsDictionary;
}) {
  return (
    <CompressorApp<DimensionsConfig>
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
        <DimensionsSettings
          {...props}
          translation={settingTranslation}
          audio={
            audioTranslation && {
              defaultKeepAudio: initialConfig.keepAudio,
              translation: audioTranslation,
            }
          }
        />
      )}
      configIsValid={dimensionsConfigIsValid}
      createJob={createDimensionsJob}
      describeConfig={(config) => ({
        resize: true,
        keep_audio: compressorType === 'video' ? config.keepAudio : undefined,
        original_format: false,
      })}
    />
  );
}
