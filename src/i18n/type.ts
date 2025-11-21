// This file defines the strict type for our translation dictionaries,
// ensuring type safety across the application.
import { ConfigMode } from '@/types/config';
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

export interface UploadDictionary {
  clickToUpload: string;
  orDragAndDrop: string;
  supports: string;
}

export interface SettingsDictionary {
  filesToCompress: string;
  addMoreFiles: string;
  compressionSettings: string;
  supportScreensUpTo: string;
  removeFile: string;
  percentWidth: string;
  setPercentage: string;
  setWidth: string;
  setHeight: string;
  configMode: Record<ConfigMode, string>;
  startCompression: string;
}

export interface ResultsDictionary {
  yourFiles: string;
  downloadAllFiles: string;
  uploadMoreFiles: string;
  waiting: string;
  running: string;
  error: string;
  compressing: string;
  inQueue: string;
  compressedFiles: string;
}
