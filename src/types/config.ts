import type { Format } from '@/utils/formats';

export type ConfigMode = 'width' | 'height' | 'percentage';

export type SizingConfig = {
  enabled: boolean;
  screenWidth: number;
  sizingType: ConfigMode;
  percentage: number;
  width: number;
  height: number;
  iconType?: string;
};

export type SizingConfigs = Record<string, SizingConfig>;

// Only videos use `keepAudio`. Images ignore it.
export type DimensionsConfig = {
  sizes: SizingConfigs;
  keepAudio: boolean;
};

// Used by the format, resize and thumbnail pages. Unlike SizingConfig,
// `percentage` here is a percentage of the original file, not of a screen
// width. `originalFormat` adds each file's own format (or the closest one we
// can write) to `formats`.
export type FormatConfig = {
  formats: Format[];
  originalFormat: boolean;
  keepAudio: boolean;
  resize: boolean;
  versions: Array<{
    name: string;
    type: ConfigMode;
    value: Record<ConfigMode, number>;
  }>;
};
