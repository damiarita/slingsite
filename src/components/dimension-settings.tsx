// Size settings of the compress pages: where the image appears (a preset, or
// one row per screen size), drawn to scale.
'use client';
import { Plus, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { AdvancedSettings } from './advanced-settings';
import { AudioSettings, getAudioActiveLabels } from './audio-settings';
import { SettingsSection } from './settings-section';
import { ScalePreview, describeOutput } from './scale-preview';
import { IconButton } from './buttons';
import type { AudioSettingsDictionary, SettingsDictionary } from '@/i18n/type';
import type { DimensionsConfig, SizingConfig } from '@/types/config';
import {
  type DeviceNames,
  type PresetId,
  createSize,
  fractions,
  getFraction,
  getPresetSizes,
  getTargetWidth,
  matchPreset,
  presetIds,
} from '@/utils/size-presets';
import { fill, formatNumber } from '@/utils/i18n-format';
import { getSizeFileKey } from '@/utils/jobs';

// Width is up to each use (full for inputs, its content for selects).
export const fieldClass =
  'min-h-11 rounded-input border border-muted bg-paper px-3 text-base text-ink tabular-nums aria-[invalid=true]:border-error aria-[invalid=true]:bg-error-wash';

const fractionKeys = ['full', 'half', 'third', 'quarter'] as const;
const fractionGlyphs = ['1', '½', '⅓', '¼'];

// Little layout drawings: which column the image takes.
const pictograms: Record<PresetId, { grow: number; on?: boolean }[]> = {
  recommended: [{ grow: 1, on: true }, { grow: 1 }, { grow: 1 }],
  blog: [{ grow: 1 }, { grow: 3, on: true }, { grow: 1 }],
  hero: [{ grow: 1, on: true }],
  grid: [{ grow: 1, on: true }, { grow: 1 }, { grow: 1 }, { grow: 1 }],
};

export function PresetPicker({
  sizes,
  deviceNames,
  translation,
  onSelect,
  className = 'flex flex-wrap items-center gap-2',
}: {
  sizes: SizingConfig[];
  deviceNames: DeviceNames;
  translation: SettingsDictionary;
  onSelect: (preset: PresetId) => void;
  className?: string;
}) {
  const current = matchPreset(sizes, deviceNames);
  return (
    <div
      role="group"
      aria-label={translation.presets.label}
      className={className}
    >
      {presetIds.map((preset) => (
        <button
          key={preset}
          type="button"
          aria-pressed={current === preset}
          onClick={() => onSelect(preset)}
          className="inline-flex min-h-14 items-center gap-3 rounded-input border border-rule bg-paper py-2 ps-3 pe-4 text-start text-ink transition-colors duration-200 hover:bg-paper-2 active:translate-y-px aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
        >
          <span
            className="flex h-[26px] w-9 flex-none gap-0.5 rounded-[3px] border-[1.5px] border-current p-0.5"
            aria-hidden="true"
          >
            {pictograms[preset].map((cell, i) => (
              <i
                key={i}
                className={`rounded-[1px] ${cell.on ? 'bg-accent' : 'bg-current opacity-20'}`}
                style={{ flexGrow: cell.grow, flexBasis: 0 }}
              />
            ))}
          </span>
          <span>
            <b className="block text-sm font-semibold">
              {translation.presets[preset].label}
            </b>
            <small className="block text-xs opacity-80">
              {translation.presets[preset].description}
            </small>
          </span>
        </button>
      ))}
      {!current && (
        <span className="text-sm text-muted">{translation.presets.custom}</span>
      )}
    </div>
  );
}

// The unique "Large screen", "Large screen 2"… for a new row.
// "Large screen", then "Large screen 2"…, with the ids large-screen,
// large-screen-2… (ids name the output files, see getSizeFileKey).
const newSizeId = 'large-screen';
const createNewSize = (sizes: SizingConfig[], baseName: string) => {
  const names = new Set(sizes.map((size) => size.name.trim().toLowerCase()));
  const keys = new Set(
    sizes.flatMap((size) => [size.id, getSizeFileKey(size)]),
  );
  for (let n = 1; ; n++) {
    const name = n === 1 ? baseName : `${baseName} ${n}`;
    const id = n === 1 ? newSizeId : `${newSizeId}-${n}`;
    if (!names.has(name.toLowerCase()) && !keys.has(id))
      return createSize(id, name, 2560, 2);
  }
};

const numberValue = (value: number) => (Number.isFinite(value) ? value : '');

function SizeRow({
  size,
  onChange,
  onRemove,
  invalidFieldId,
  translation,
  locale,
}: {
  size: SizingConfig;
  onChange: (size: SizingConfig) => void;
  onRemove: () => void;
  invalidFieldId?: string;
  translation: SettingsDictionary;
  locale: string;
}) {
  const ids = {
    name: `size-name-${size.id}`,
    screen: `size-screen-${size.id}`,
    px: `size-px-${size.id}`,
  };
  const fraction =
    size.sizingType === 'percentage' ? getFraction(size) : undefined;
  const exact = size.sizingType !== 'percentage';
  const segmentClass =
    'min-h-11 min-w-11 bg-paper px-2 text-ink transition-colors duration-150 hover:bg-paper-2 focus-visible:-outline-offset-[3px] aria-pressed:bg-ink aria-pressed:text-paper [&+&]:border-s [&+&]:border-rule';

  return (
    <div
      role="row"
      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.75rem] items-center gap-3 border-b border-rule py-3 lg:grid-cols-[minmax(0,1.2fr)_8.5rem_15rem_minmax(6rem,0.8fr)_2.75rem]"
    >
      <div
        role="cell"
        className="col-start-1 row-start-1 lg:col-auto lg:row-auto"
      >
        <input
          id={ids.name}
          type="text"
          value={size.name}
          onChange={(e) =>
            onChange({ ...size, name: e.target.value, renamed: true })
          }
          aria-label={translation.columns.name}
          aria-invalid={invalidFieldId === ids.name || undefined}
          autoComplete="off"
          className={`${fieldClass} w-full`}
        />
      </div>
      <div
        role="cell"
        className="relative col-start-2 row-start-1 lg:col-auto lg:row-auto"
      >
        <input
          id={ids.screen}
          type="number"
          inputMode="numeric"
          min={1}
          value={numberValue(size.screenWidth)}
          onChange={(e) =>
            onChange({
              ...size,
              screenWidth: Math.round(e.target.valueAsNumber),
            })
          }
          aria-label={`${translation.columns.screen} (px)`}
          aria-invalid={invalidFieldId === ids.screen || undefined}
          className={`${fieldClass} w-full pe-10`}
        />
        <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-muted">
          px
        </span>
      </div>
      <div role="cell" className="col-span-3 lg:col-span-1">
        <div
          role="group"
          aria-label={translation.columns.fills}
          className="inline-flex overflow-hidden rounded-input border border-rule"
        >
          {fractions.map((n, i) => (
            <button
              key={n}
              type="button"
              aria-pressed={fraction === n}
              aria-label={translation.fills[fractionKeys[i]]}
              title={translation.fills[fractionKeys[i]]}
              onClick={() =>
                onChange({
                  ...size,
                  sizingType: 'percentage',
                  percentage: 100 / n,
                })
              }
              className={segmentClass}
            >
              {fractionGlyphs[i]}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={exact}
            onClick={() => {
              if (!exact)
                onChange({
                  ...size,
                  sizingType: 'width',
                  width: getTargetWidth(size) ?? size.width,
                });
            }}
            className={`${segmentClass} text-sm`}
          >
            {translation.exact}
          </button>
        </div>
        {exact && (
          <div className="mt-2 flex gap-2">
            <select
              value={size.sizingType}
              onChange={(e) =>
                onChange({
                  ...size,
                  sizingType: e.target.value as 'width' | 'height',
                })
              }
              aria-label={translation.widthOrHeight}
              className={`${fieldClass} shrink-0`}
            >
              <option value="width">{translation.width}</option>
              <option value="height">{translation.height}</option>
            </select>
            <div className="relative min-w-24 flex-1">
              <input
                id={ids.px}
                type="number"
                inputMode="numeric"
                min={1}
                value={numberValue(size[size.sizingType])}
                onChange={(e) =>
                  onChange({
                    ...size,
                    [size.sizingType]: Math.round(e.target.valueAsNumber),
                  })
                }
                aria-label={`${translation.pixels} (px)`}
                aria-invalid={invalidFieldId === ids.px || undefined}
                className={`${fieldClass} w-full pe-10`}
              />
              <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                px
              </span>
            </div>
          </div>
        )}
      </div>
      <div
        role="cell"
        className="col-span-3 font-semibold tabular-nums lg:col-span-1 lg:text-end"
      >
        {describeOutput(size, translation, locale)}
        <small className="block text-xs font-normal text-muted">
          {fraction
            ? fill(translation.ofScreen, {
                fraction: translation.fills[fractionKeys[fraction - 1]],
                screen: formatNumber(locale, size.screenWidth || 0),
              })
            : translation.exactSize}
        </small>
      </div>
      <div
        role="cell"
        className="col-start-3 row-start-1 lg:col-auto lg:row-auto"
      >
        <IconButton
          label={fill(translation.removeSize, { name: size.name })}
          onClick={onRemove}
        >
          <X className="size-5" aria-hidden="true" />
        </IconButton>
      </div>
    </div>
  );
}

export const DimensionsSettings = ({
  config: dimensionsConfig,
  setConfig: setDimensionsConfig,
  invalidFieldId,
  deviceNames,
  translation,
  audio,
}: {
  config: DimensionsConfig;
  setConfig: (config: DimensionsConfig) => void;
  invalidFieldId?: string;
  deviceNames: DeviceNames;
  translation: SettingsDictionary;
  // Only for videos. Without it there are no advanced settings.
  audio?: {
    defaultKeepAudio: boolean;
    translation: AudioSettingsDictionary;
  };
}) => {
  const locale = useLocale();
  const sizes = dimensionsConfig.sizes;
  const setSizes = (newSizes: SizingConfig[]) =>
    setDimensionsConfig({ ...dimensionsConfig, sizes: newSizes });

  const addSize = () =>
    setSizes([...sizes, createNewSize(sizes, translation.newSizeName)]);

  return (
    <>
      <SettingsSection
        title={translation.whereTitle}
        note={translation.whereNote}
      >
        <PresetPicker
          sizes={sizes}
          deviceNames={deviceNames}
          translation={translation}
          onSelect={(preset) => setSizes(getPresetSizes(preset, deviceNames))}
        />
        <div role="table" aria-label={translation.whereTitle} className="mt-6">
          <div
            role="row"
            className="hidden grid-cols-[minmax(0,1.2fr)_8.5rem_15rem_minmax(6rem,0.8fr)_2.75rem] gap-3 border-b border-rule py-2 text-sm text-muted lg:grid"
          >
            <span role="columnheader">{translation.columns.name}</span>
            <span role="columnheader">{translation.columns.screen}</span>
            <span role="columnheader">{translation.columns.fills}</span>
            <span role="columnheader" className="text-end">
              {translation.columns.output}
            </span>
            <span />
          </div>
          <div role="rowgroup">
            {sizes.map((size, index) => (
              <SizeRow
                key={size.id}
                size={size}
                onChange={(newSize) =>
                  setSizes(sizes.map((s, i) => (i === index ? newSize : s)))
                }
                onRemove={() => setSizes(sizes.filter((_, i) => i !== index))}
                invalidFieldId={invalidFieldId}
                translation={translation}
                locale={locale}
              />
            ))}
          </div>
        </div>
        <button
          id="size-add"
          type="button"
          onClick={addSize}
          className="mt-2 inline-flex min-h-12 items-center gap-2 font-semibold text-accent-deep hover:text-ink"
        >
          <Plus className="size-5" aria-hidden="true" />
          {translation.addSize}
        </button>
        <div className="mt-6">
          <ScalePreview
            sizes={sizes}
            translation={translation}
            locale={locale}
          />
        </div>
      </SettingsSection>
      {audio && (
        <AdvancedSettings
          label={translation.advancedSettings}
          activeLabels={getAudioActiveLabels(
            dimensionsConfig.keepAudio,
            audio.defaultKeepAudio,
            audio.translation,
          )}
        >
          <AudioSettings
            keepAudio={dimensionsConfig.keepAudio}
            setKeepAudio={(keepAudio) =>
              setDimensionsConfig({ ...dimensionsConfig, keepAudio })
            }
            translation={audio.translation}
          />
        </AdvancedSettings>
      )}
    </>
  );
};
