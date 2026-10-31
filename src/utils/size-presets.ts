import type { SizingConfig } from '@/types/config';

// Layouts offered by the compress pages' size settings (and the home page's
// demo). Each one sets the three default devices; their names come from the
// `devices` dictionary, so they stay translated.
export type DeviceNames = { mobile: string; tablet: string; desktop: string };
type Device = keyof DeviceNames;

export const presetIds = ['recommended', 'blog', 'hero', 'grid'] as const;
export type PresetId = (typeof presetIds)[number];

// How much of the screen width the image takes: 1 = full, 2 = half…
export const fractions = [1, 2, 3, 4] as const;

const screenWidths: Record<Device, number> = {
  mobile: 450,
  tablet: 1050,
  desktop: 1950,
};

type Fill = number | { width: number };
const presetFills: Record<PresetId, Record<Device, Fill>> = {
  recommended: { mobile: 1, tablet: 2, desktop: 3 },
  blog: { mobile: 1, tablet: 1, desktop: { width: 800 } },
  hero: { mobile: 1, tablet: 1, desktop: 1 },
  grid: { mobile: 2, tablet: 3, desktop: 4 },
};

export function createSize(
  id: string,
  name: string,
  screenWidth: number,
  fill: Fill,
): SizingConfig {
  const percentage = typeof fill === 'number' ? 100 / fill : 100;
  return {
    id,
    name,
    screenWidth,
    sizingType: typeof fill === 'number' ? 'percentage' : 'width',
    percentage,
    width:
      typeof fill === 'number'
        ? Math.round((screenWidth * percentage) / 100)
        : fill.width,
    height: 600,
  };
}

export const getPresetSizes = (
  preset: PresetId,
  deviceNames: DeviceNames,
): SizingConfig[] =>
  (Object.keys(screenWidths) as Device[]).map((device) =>
    createSize(
      device,
      deviceNames[device],
      screenWidths[device],
      presetFills[preset][device],
    ),
  );

// The layout fraction (1, 2, 3, 4) of a percentage size, if it is one.
export const getFraction = (size: SizingConfig) =>
  fractions.find(
    (fraction) => Math.abs(100 / fraction - size.percentage) < 0.01,
  );

// The width the output aims for (before "never upscale"), or undefined for
// an exact height.
export const getTargetWidth = (size: SizingConfig) =>
  size.sizingType === 'percentage'
    ? Math.round((size.screenWidth * size.percentage) / 100)
    : size.sizingType === 'width'
      ? size.width
      : undefined;

const sameSize = (a: SizingConfig, b: SizingConfig) =>
  a.name === b.name &&
  a.screenWidth === b.screenWidth &&
  a.sizingType === b.sizingType &&
  (a.sizingType === 'percentage'
    ? Math.abs(a.percentage - b.percentage) < 0.01
    : a[a.sizingType] === b[b.sizingType]);

// Which preset the sizes still match, so editing one shows "Custom sizes".
export const matchPreset = (
  sizes: SizingConfig[],
  deviceNames: DeviceNames,
): PresetId | undefined =>
  presetIds.find((preset) => {
    const presetSizes = getPresetSizes(preset, deviceNames);
    return (
      presetSizes.length === sizes.length &&
      presetSizes.every((size, i) => sameSize(size, sizes[i]))
    );
  });
