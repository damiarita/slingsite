'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { IconButton } from './buttons';
import { AdvancedSettings } from './advanced-settings';
import {
  AudioSettings,
  SwitchRow,
  getAudioActiveLabels,
} from './audio-settings';
import { SettingsSection } from './settings-section';
import { fieldClass } from './dimension-settings';
import type { ConfigMode, FormatConfig } from '@/types/config';
import type { Format } from '@/utils/formats';
import type {
  AudioSettingsDictionary,
  FormatSettingsDictionary,
} from '@/i18n/type';
import { fill, formatNumber } from '@/utils/i18n-format';

const percentagePresets = [100, 75, 50, 25];

type Props = {
  config: FormatConfig;
  setConfig: (config: FormatConfig) => void;
  translation: FormatSettingsDictionary;
  invalidFieldId?: string;
};

type FormatPickerProps = Props & {
  availableFormats: Format[];
  formatsTranslation: Record<Format, string>;
  // Resize pages: offer keeping each file in its own format.
  showOriginalFormat?: boolean;
};

// The first field a "no format" problem focuses.
export const getFormatPickerFieldId = (
  availableFormats: Format[],
  showOriginalFormat?: boolean,
) => (showOriginalFormat ? 'format-original' : `format-${availableFormats[0]}`);
export const getVersionFieldId = (index: number) => `version-value-${index}`;

export const FormatPicker = ({
  config,
  setConfig,
  translation,
  invalidFieldId,
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
  const noFormat = config.formats.length === 0 && !config.originalFormat;

  return (
    <div className="grid gap-3">
      {showOriginalFormat && (
        <SwitchRow
          id="format-original"
          label={translation.originalFormat}
          description={translation.originalFormatDescription}
          checked={config.originalFormat}
          onChange={() =>
            setConfig({ ...config, originalFormat: !config.originalFormat })
          }
        />
      )}
      <div
        role="group"
        aria-label={translation.outputFormats}
        className={`grid gap-2 sm:grid-cols-2 ${availableFormats.length === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}
      >
        {availableFormats.map((format) => (
          <label
            key={format}
            className="flex min-h-14 cursor-pointer items-center gap-3 rounded-input border border-rule bg-paper px-4 py-2 transition-colors duration-150 hover:bg-paper-2 has-checked:border-accent-deep has-checked:bg-accent-wash"
          >
            <input
              type="checkbox"
              id={`format-${format}`}
              checked={config.formats.includes(format)}
              onChange={() => handleFormatToggle(format)}
              aria-invalid={invalidFieldId === `format-${format}` || undefined}
              className="size-5 shrink-0 accent-accent-deep"
            />
            <span className="font-semibold">
              {formatsTranslation[format] ?? format}
            </span>
          </label>
        ))}
      </div>
      {noFormat && (
        <p className="text-sm text-error">{translation.problems.noFormat}</p>
      )}
    </div>
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

const isPresetPercentage = (version: Version) =>
  version.type === 'percentage' &&
  percentagePresets.includes(version.value.percentage);

const VersionRow = ({
  version,
  index,
  onChange,
  onRemove,
  invalidFieldId,
  translation,
}: {
  version: Version;
  index: number;
  onChange: (version: Version) => void;
  onRemove?: () => void;
  invalidFieldId?: string;
  translation: FormatSettingsDictionary;
}) => {
  const locale = useLocale();
  // "Custom" stays open while its percentage happens to match a preset.
  const [custom, setCustom] = useState(!isPresetPercentage(version));
  const fieldId = getVersionFieldId(index);
  const value = version.value[version.type];
  const segmentClass =
    'min-h-11 min-w-14 bg-paper px-2 text-sm text-ink tabular-nums transition-colors duration-150 hover:bg-paper-2 focus-visible:-outline-offset-[3px] aria-pressed:bg-ink aria-pressed:text-paper [&+&]:border-s [&+&]:border-rule';
  const output =
    version.type === 'percentage'
      ? fill(translation.outputPercent, {
          percent: formatNumber(locale, value || 0),
        })
      : fill(
          version.type === 'width'
            ? translation.outputWide
            : translation.outputTall,
          { px: formatNumber(locale, value || 0) },
        );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_2.75rem] items-center gap-3 border-b border-rule py-3 lg:grid-cols-[minmax(0,1fr)_19rem_minmax(8rem,auto)_2.75rem]">
      <span className="font-semibold">{version.name}</span>
      <div className="col-span-2 row-start-2 lg:col-span-1 lg:row-start-auto">
        <div
          role="group"
          aria-label={translation.sizeLabel}
          className="inline-flex flex-wrap overflow-hidden rounded-input border border-rule"
        >
          {percentagePresets.map((percentage) => (
            <button
              key={percentage}
              type="button"
              aria-pressed={
                !custom &&
                version.type === 'percentage' &&
                version.value.percentage === percentage
              }
              onClick={() => {
                setCustom(false);
                onChange({
                  ...version,
                  type: 'percentage',
                  value: { ...version.value, percentage },
                });
              }}
              className={segmentClass}
            >
              {formatNumber(locale, percentage)}%
            </button>
          ))}
          <button
            type="button"
            aria-pressed={custom}
            onClick={() => setCustom(true)}
            className={segmentClass}
          >
            {translation.custom}
          </button>
        </div>
        {custom && (
          <div className="mt-2 flex gap-2">
            <select
              value={version.type}
              onChange={(e) =>
                onChange({ ...version, type: e.target.value as ConfigMode })
              }
              aria-label={translation.sizeLabel}
              className={`${fieldClass} shrink-0`}
            >
              <option value="width">{translation.width}</option>
              <option value="height">{translation.height}</option>
              <option value="percentage">{translation.percent}</option>
            </select>
            <div className="relative min-w-24 flex-1">
              <input
                id={fieldId}
                type="number"
                inputMode="numeric"
                min={1}
                // Nothing is upscaled, so more than 100% changes nothing.
                max={version.type === 'percentage' ? 100 : undefined}
                value={Number.isFinite(value) ? value : ''}
                onChange={(e) =>
                  onChange({
                    ...version,
                    value: {
                      ...version.value,
                      [version.type]: e.target.valueAsNumber,
                    },
                  })
                }
                aria-label={`${translation.sizeLabel} (${version.type === 'percentage' ? '%' : 'px'})`}
                aria-invalid={invalidFieldId === fieldId || undefined}
                className={`${fieldClass} w-full pe-10`}
              />
              <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                {version.type === 'percentage' ? '%' : 'px'}
              </span>
            </div>
          </div>
        )}
      </div>
      <span className="col-span-2 font-semibold tabular-nums lg:col-span-1 lg:text-end">
        {output}
      </span>
      <div className="col-start-2 row-start-1 lg:col-start-auto lg:row-start-auto">
        {onRemove && (
          <IconButton
            label={fill(translation.removeSize, { name: version.name })}
            onClick={onRemove}
          >
            <X className="size-5" aria-hidden="true" />
          </IconButton>
        )}
      </div>
    </div>
  );
};

// One output size per version. Starts with one; "Add a size" adds another.
// `required` (resize pages) drops the on/off switch: resizing is the point.
// `versionName` is the base name of new versions (default "Resized").
export const ResizeSettings = ({
  config,
  setConfig,
  translation,
  invalidFieldId,
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
    <div>
      <div className="border-t border-rule">
        {config.versions.map((version, index) => (
          <VersionRow
            key={version.name}
            version={version}
            index={index}
            onChange={(newVersion) => updateVersion(index, newVersion)}
            onRemove={
              config.versions.length > 1
                ? () => removeVersion(index)
                : undefined
            }
            invalidFieldId={invalidFieldId}
            translation={translation}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={addVersion}
        className="mt-2 inline-flex min-h-12 items-center gap-2 font-semibold text-accent-deep hover:text-ink"
      >
        <Plus className="size-5" aria-hidden="true" />
        {translation.addSize}
      </button>
    </div>
  );

  if (required) return versions;

  return (
    <div className="grid gap-4">
      <SwitchRow
        id="resize-toggle"
        label={translation.resize}
        description={config.resize ? undefined : translation.resizeDescription}
        checked={config.resize}
        onChange={() => setConfig({ ...config, resize: !config.resize })}
      />
      {config.resize && versions}
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
    invalidFieldId,
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
      invalidFieldId={invalidFieldId}
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

  return (
    <>
      {primary === 'resize' ? (
        <SettingsSection
          title={translation.outputSizes}
          note={translation.sizesNote}
        >
          {resizeSettings}
        </SettingsSection>
      ) : (
        <SettingsSection
          title={translation.outputFormats}
          note={translation.formatsNote}
        >
          <FormatPicker {...props} />
        </SettingsSection>
      )}
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
        revealed={invalidFieldId?.startsWith(
          primary === 'resize' ? 'format-' : 'version-',
        )}
      >
        {primary === 'resize' ? (
          <div className="grid gap-3">
            <h3 className="font-semibold tracking-normal">
              {translation.outputFormats}
            </h3>
            <FormatPicker {...props} />
          </div>
        ) : (
          resizeSettings
        )}
        {audioSettings}
      </AdvancedSettings>
    </>
  );
};
