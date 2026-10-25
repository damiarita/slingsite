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
import type { Tool } from '@/utils/tool-pages';

// Format, resize and thumbnail pages. They share the config and the app; only
// which section comes first, the wording and the output names change.
export default function ToolCompressorPage({
  tool,
  compressorType,
  initialConfig,
  availableFormats,
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
  uploadTranslation: UploadDictionary;
  formatSettingTranslation: FormatSettingsDictionary;
  formatsTranslation: Record<Format, string>;
  resultTranslation: ResultsDictionary;
  // Videos only (not thumbnails): shows the audio toggle.
  audioTranslation?: AudioSettingsDictionary;
}) {
  const t = formatSettingTranslation;
  const shell = {
    format: {
      filesTitle: t.filesToConvert,
      start: t.startConversion,
      unresizedName: t.converted,
      versionName: t.resized,
      resultsTitle: t.convertedFiles,
      working: t.converting,
    },
    resize: {
      filesTitle: t.filesToResize,
      start: t.startResize,
      unresizedName: t.resized,
      versionName: t.resized,
      resultsTitle: t.resizedFiles,
      working: t.resizing,
    },
    thumbnail: {
      filesTitle: t.videosForThumbnails,
      start: t.startThumbnail,
      unresizedName: t.thumbnail,
      versionName: t.thumbnail,
      resultsTitle: t.extractedThumbnails,
      working: t.extracting,
    },
  }[tool];

  return (
    <CompressorApp<FormatConfig>
      compressorType={compressorType}
      initialConfig={initialConfig}
      translation={{
        filesTitle: shell.filesTitle,
        addMoreFiles: t.addMoreFiles,
        removeFile: t.removeFile,
        start: shell.start,
      }}
      uploadTranslation={uploadTranslation}
      // The results dictionary words things for the compress pages
      resultTranslation={{
        ...resultTranslation,
        compressedFiles: shell.resultsTitle,
        compressing: shell.working,
      }}
      renderSettings={(props) => (
        <FormatSettings
          {...props}
          primary={tool === 'resize' ? 'resize' : 'formats'}
          initialConfig={initialConfig}
          versionName={shell.versionName}
          availableFormats={availableFormats}
          showOriginalFormat={tool === 'resize'}
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
      configIsValid={formatConfigIsValid}
      createJob={(file, config) =>
        createFormatJob(file, config, shell.unresizedName)
      }
    />
  );
}
