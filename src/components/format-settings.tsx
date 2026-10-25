'use client';

import { FileImage, FileVideo, Plus, Scaling, Settings, X } from 'lucide-react';
import { SecondaryButton } from './buttons';
import { Switch } from './switch';
import { AdvancedSettings } from './advanced-settings';
import { AudioSettings, getAudioActiveLabels } from './audio-settings';
import type { ConfigMode, FormatConfig } from '@/types/config';
import type { Format } from '@/utils/formats';
import { isVideoFormat } from '@/utils/formats';
import type {
  AudioSettingsDictionary,
  FormatSettingsDictionary,
} from '@/i18n/type';

const percentagePresets = [
  { label: '100%', value: 100 },
  { label: '75%', value: 75 },
  { label: '50%', value: 50 },
  { label: '25%', value: 25 },
];

type Props = {
  config: FormatConfig;
  setConfig: (config: FormatConfig) => void;
  translation: FormatSettingsDictionary;
};

type FormatPickerProps = Props & {
  availableFormats: Format[];
  formatsTranslation: Record<Format, string>;
  // Resize pages: offer keeping each file in its own format.
  showOriginalFormat?: boolean;
};

export const FormatPicker = ({
  config,
  setConfig,
  translation,
  availableFormats,
  formatsTranslation,
  showOriginalFormat,
}: FormatPickerProps) => {
  const handleFormatToggle = (format: Format) => {
    const formats = config.formats.includes(format)
      ? config.formats.filter((f) => f !== format)
      : [...config.formats, format];
    setConfig({ ...config, formats });
  };

  return (
    <>
      {showOriginalFormat && (
        <div
          className={`flex items-center justify-between gap-4 p-4 mb-4 rounded-lg transition-all duration-300 ${config.originalFormat ? 'bg-gray-50 ring-2 ring-blue-200' : 'bg-gray-100 opacity-70'}`}
        >
          <div>
            <label
              htmlFor="format-original"
              className="font-semibold text-gray-700"
            >
              {translation.originalFormat}
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {translation.originalFormatDescription}
            </p>
          </div>
          <Switch
            id="format-original"
            checked={config.originalFormat}
            onChange={() =>
              setConfig({ ...config, originalFormat: !config.originalFormat })
            }
          />
        </div>
      )}
      <div
        className={`grid grid-cols-1 gap-4 mb-2 ${availableFormats.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}
      >
        {availableFormats.map((format) => {
          const isSelected = config.formats.includes(format);
          const Icon = isVideoFormat(format) ? FileVideo : FileImage;
          return (
            <div
              key={format}
              className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${isSelected ? 'bg-gray-50 ring-2 ring-blue-200' : 'bg-gray-100 opacity-70'}`}
            >
              <div className="flex items-center font-semibold text-gray-700">
                <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
                <label htmlFor={`format-${format}`}>
                  {formatsTranslation[format] ?? format}
                </label>
              </div>
              <Switch
                id={`format-${format}`}
                checked={isSelected}
                onChange={() => handleFormatToggle(format)}
              />
            </div>
          );
        })}
      </div>
      {config.formats.length === 0 && !config.originalFormat && (
        <p className="text-sm text-red-600 mb-2">
          {translation.selectFormatFirst}
        </p>
      )}
    </>
  );
};

type Version = FormatConfig['versions'][number];

// Version names are the output config names (results and filenames), so they
// must be unique: base, base-2, base-3…
const getNewVersionName = (versions: Version[], base: string) => {
  const names = new Set(versions.map((version) => version.name));
  if (!names.has(base)) return base;
  let n = 2;
  while (names.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
};

const VersionSettings = ({
  version,
  onChange,
  onRemove,
  translation,
}: {
  version: Version;
  onChange: (version: Version) => void;
  onRemove?: () => void;
  translation: FormatSettingsDictionary;
}) => {
  const handleModeChange = (mode: ConfigMode) => {
    onChange({ ...version, type: mode });
  };

  const handleInputChange = (field: ConfigMode, value: number) => {
    onChange({ ...version, value: { ...version.value, [field]: value } });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">
          {version.name}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            aria-label={translation.removeSize}
            title={translation.removeSize}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <label className="text-sm font-medium text-gray-600">
        {translation.configMode[version.type]}
      </label>
      {version.type === 'percentage' ? (
        <>
          <div className="grid grid-cols-4 gap-2 mt-1">
            {percentagePresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handleInputChange('percentage', preset.value)}
                className={`text-xs p-2 rounded-md transition-colors ${Math.round(preset.value) === Math.round(version.value.percentage) ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-2">
            <input
              type="range"
              min="1"
              max="100"
              value={version.value.percentage}
              onChange={(e) =>
                handleInputChange('percentage', parseInt(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center text-sm text-gray-600 mt-1">
              {Math.round(version.value.percentage)}
              {translation.percentWidth}
            </div>
          </div>
        </>
      ) : (
        <div className="relative mt-1">
          <input
            type="number"
            placeholder={`e.g., ${version.type === 'width' ? 1200 : 800}`}
            value={version.value[version.type]}
            onChange={(e) =>
              handleInputChange(version.type, parseFloat(e.target.value))
            }
            className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
            px
          </span>
        </div>
      )}
      <div className="flex space-x-2 mt-3 text-xs">
        {version.type === 'percentage' || (
          <button
            onClick={() => handleModeChange('percentage')}
            className="flex-1 py-1 px-2 border rounded-md hover:bg-gray-100"
          >
            {translation.setPercentage}
          </button>
        )}
        {version.type === 'width' || (
          <button
            onClick={() => handleModeChange('width')}
            className="flex-1 py-1 px-2 border rounded-md hover:bg-gray-100"
          >
            {translation.setWidth}
          </button>
        )}
        {version.type === 'height' || (
          <button
            onClick={() => handleModeChange('height')}
            className="flex-1 py-1 px-2 border rounded-md hover:bg-gray-100"
          >
            {translation.setHeight}
          </button>
        )}
      </div>
    </div>
  );
};

// One output size per version. Starts with one; "More sizes" adds another.
// `required` (resize pages) drops the on/off switch: resizing is the point.
// `versionName` is the base name of new versions (default "Resized").
export const ResizeSettings = ({
  config,
  setConfig,
  translation,
  required,
  versionName = translation.resized,
}: Props & { required?: boolean; versionName?: string }) => {
  const updateVersion = (index: number, newVersion: Version) => {
    setConfig({
      ...config,
      versions: config.versions.map((version, i) =>
        i === index ? newVersion : version,
      ),
    });
  };

  const removeVersion = (index: number) => {
    setConfig({
      ...config,
      versions: config.versions.filter((_, i) => i !== index),
    });
  };

  const addVersion = () => {
    const last = config.versions[config.versions.length - 1];
    setConfig({
      ...config,
      versions: [
        ...config.versions,
        {
          name: getNewVersionName(config.versions, versionName),
          type: last?.type ?? 'percentage',
          value: { percentage: 50, width: 800, height: 600 },
        },
      ],
    });
  };

  const versions = (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {config.versions.map((version, index) => (
          <VersionSettings
            key={version.name}
            version={version}
            onChange={(newVersion) => updateVersion(index, newVersion)}
            onRemove={
              config.versions.length > 1
                ? () => removeVersion(index)
                : undefined
            }
            translation={translation}
          />
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <SecondaryButton onClick={addVersion}>
          <Plus className="w-4 h-4 me-2" />
          {translation.moreSizes}
        </SecondaryButton>
      </div>
    </>
  );

  if (required) return versions;

  return (
    <div
      className={`rounded-lg transition-all duration-300 ${config.resize ? 'bg-gray-50 ring-2 ring-blue-200' : 'bg-gray-100'}`}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center font-semibold text-gray-700">
          <label htmlFor="resize-toggle">{translation.resize}</label>
        </div>
        <Switch
          id="resize-toggle"
          checked={config.resize}
          onChange={() => setConfig({ ...config, resize: !config.resize })}
        />
      </div>
      {!config.resize && (
        <p className="px-4 pb-3 -mt-2 text-xs text-gray-500">
          {translation.resizeDescription}
        </p>
      )}
      {config.resize && <div className="px-4 pb-4">{versions}</div>}
    </div>
  );
};

const sameFormats = (a: FormatConfig, b: FormatConfig) =>
  a.originalFormat === b.originalFormat &&
  a.formats.length === b.formats.length &&
  a.formats.every((format) => b.formats.includes(format));

// Two layouts:
// - 'formats' (format and thumbnail pages): output formats first, resizing
//   (and audio, for videos) behind "advanced settings".
// - 'resize' (resize pages): sizes first, output formats (and audio) behind
//   "advanced settings".
export const FormatSettings = (
  props: FormatPickerProps & {
    primary: 'formats' | 'resize';
    // The page defaults: advanced settings that differ show as badges.
    initialConfig: FormatConfig;
    versionName?: string;
    // Only for videos. Without it there is no audio toggle.
    audio?: {
      defaultKeepAudio: boolean;
      translation: AudioSettingsDictionary;
    };
  },
) => {
  const {
    config,
    setConfig,
    translation,
    audio,
    primary,
    initialConfig,
    versionName,
  } = props;

  const resizeSettings = (
    <ResizeSettings
      config={config}
      setConfig={setConfig}
      translation={translation}
      required={primary === 'resize'}
      versionName={versionName}
    />
  );
  const audioSettings = audio && (
    <AudioSettings
      keepAudio={config.keepAudio}
      setKeepAudio={(keepAudio) => setConfig({ ...config, keepAudio })}
      translation={audio.translation}
    />
  );
  const audioLabels = audio
    ? getAudioActiveLabels(
        config.keepAudio,
        audio.defaultKeepAudio,
        audio.translation,
      )
    : [];
  const Icon = primary === 'resize' ? Scaling : Settings;

  return (
    <>
      <div className="flex items-center mb-4">
        <Icon className="w-6 h-6 text-gray-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">
          {primary === 'resize'
            ? translation.outputSizes
            : translation.outputFormats}
        </h3>
      </div>
      {primary === 'resize' ? resizeSettings : <FormatPicker {...props} />}
      <AdvancedSettings
        label={translation.advancedSettings}
        activeLabels={[
          ...(primary === 'resize'
            ? sameFormats(config, initialConfig)
              ? []
              : [translation.outputFormats]
            : config.resize
              ? [translation.resize]
              : []),
          ...audioLabels,
        ]}
      >
        {primary === 'resize' ? <FormatPicker {...props} /> : resizeSettings}
        {audioSettings}
      </AdvancedSettings>
    </>
  );
};
