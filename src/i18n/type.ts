// This file defines the strict type for our translation dictionaries,
// ensuring type safety across the application.
import {
  ConsentModalOptions,
  PreferencesModalOptions,
} from 'vanilla-cookieconsent';

export interface CookieConsentTranslations {
  consentModal: ConsentModalOptions;
  preferencesModal: PreferencesModalOptions;
}
export interface RedirectingTranslations {
  redirecting: string;
}
export interface BlogTranslations {
  publidhed_on: string;
  last_edited_on: string;
}
export interface PageMetadata {
  title: string;
  description: string;
}
export interface CompressionPageSeoTranslations {
  title: string;
  subtitle: string;
}
export interface NavBarTranslations {
  imageCompressor: string;
  videoCompressor: string;
}

export interface FooterTranslations {
  claim: string;
  headings: {
    connect: string;
    legal: string;
    development: string;
    languages: string;
  };
  suscribe: string;
  contactUs: string;
  cookies: string;
  sourceCode: string;
  issues: string;
  copyright: string;
}

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

export interface UploadDictionary {
  clickToUpload: string;
  orDragAndDrop: string;
  supports: string;
}
