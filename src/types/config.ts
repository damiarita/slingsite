import type { Format } from '@/utils/formats';

export type ConfigMode = 'width' | 'height' | 'percentage';

// One output size of the compress pages ("Mobile", "Desktop"…). `name` is
// translated and shown in the results. The output file names use `id`, an
// English slug (mobile, tablet, desktop, large-screen), so they are the same
// in every language, until the visitor renames the size (`renamed`): then
// they use the new name (getSizeFileKey). `percentage` is a share of
// `screenWidth` (100 / 2 / 33.33 / 25: the layout fractions); `width` and
// `height` are exact sizes. All three are kept while switching `sizingType`,
// so going back restores the previous value.
export type SizingConfig = {
  id: string;
  name: string;
  renamed?: boolean;
  screenWidth: number;
  sizingType: ConfigMode;
  percentage: number;
  width: number;
  height: number;
};

// Only videos use `keepAudio`. Images ignore it.
export type DimensionsConfig = {
  sizes: SizingConfig[];
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
