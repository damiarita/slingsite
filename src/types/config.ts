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

// Used by the format pages. Unlike SizingConfig, `percentage` here is a
// percentage of the original file, not of a screen width.
export type FormatConfig = {
  formats: Format[];
  resize: boolean;
  versions: Array<{
    name: string;
    type: ConfigMode;
    value: Record<ConfigMode, number>;
  }>;
};
