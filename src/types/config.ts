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
