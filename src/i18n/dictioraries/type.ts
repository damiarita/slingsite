// This file defines the strict type for our translation dictionaries,
// ensuring type safety across the application.

export interface Navigation {
  imageCompressor: string;
  videoCompressor: string;
}

export interface UploadArea {
    title: string;
    subtitle: string;
  }

export interface CompressorPageDictionary {
  title: string;
  uploadArea: UploadArea;
  settingsTitle: string;
  viewport: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  deviceWidth: string;
  sizingMethod: string;
  methods: {
    percentage: string;
    columns: string;
    fixedWidth: string;
    fixedHeight: string;
  };
  value: string;
  compressButton: string;
  resultsTitle: string;
  downloadAll: string;
  original: string;
  compressed: string;
  format: string;
  dimensions: string;
  size: string;
  reduction: string;
  download: string;
}

export interface Dictionary {
  redirecting: string;
  processing: string,
  navigation: Navigation;
  imageCompressor: CompressorPageDictionary;
}