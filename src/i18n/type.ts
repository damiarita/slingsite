// This file defines the strict type for our translation dictionaries,
// ensuring type safety across the application.
import type { ConfigMode } from '@/types/config';
import type {
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
  browse_posts_description: string;
  published_on: string;
  last_edited_on: string;
  read_time: string;
  read_article: string;
  enjoyed_question: string;
  share_or_subscribe: string;
  subscribe: string;
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
  images: string;
  videos: string;
  imageCompressor: string;
  videoCompressor: string;
  imageConverter: string;
  videoConverter: string;
  imageResizer: string;
  videoResizer: string;
  videoThumbnail: string;
  menu: string;
  openMenu: string;
  closeMenu: string;
}

export interface FooterTranslations {
  claim: string;
  headings: {
    connect: string;
    legal: string;
    development: string;
    languages: string;
    comparisons: string;
  };
  subscribe: string;
  contactUs: string;
  cookies: string;
  sourceCode: string;
  issues: string;
  copyright: string;
  comparisonsSlug: string;
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
  advancedSettings: string;
  supportScreensUpTo: string;
  removeFile: string;
  percentWidth: string;
  setPercentage: string;
  setWidth: string;
  setHeight: string;
  configMode: Record<ConfigMode, string>;
  startCompression: string;
}

export interface FormatSettingsDictionary {
  filesToConvert: string;
  addMoreFiles: string;
  removeFile: string;
  outputFormats: string;
  advancedSettings: string;
  resize: string;
  resized: string;
  converted: string;
  resizeDescription: string;
  moreSizes: string;
  removeSize: string;
  selectFormatFirst: string;
  percentWidth: string;
  setPercentage: string;
  setWidth: string;
  setHeight: string;
  configMode: Record<ConfigMode, string>;
  startConversion: string;
  outputSizes: string;
  originalFormat: string;
  originalFormatDescription: string;
  filesToResize: string;
  startResize: string;
  thumbnail: string;
  startThumbnail: string;
  videosForThumbnails: string;
  // Results panel, replacing the compress wording of ResultsDictionary
  convertedFiles: string;
  resizedFiles: string;
  extractedThumbnails: string;
  converting: string;
  resizing: string;
  extracting: string;
}

export interface AudioSettingsDictionary {
  keepAudio: string;
  keepAudioDescription: string;
  noAudio: string;
}

export interface FormatLinksDictionary {
  imageHeading: string;
  videoHeading: string;
  anyImageTo: string; // {to}
  anyVideoTo: string; // {to}
  fromTo: string; // {from}, {to}
  resizeImageHeading: string;
  resizeVideoHeading: string;
  resize: string; // {format}
  thumbnailHeading: string;
  thumbnailTo: string; // {to}
  thumbnailFrom: string; // {from}
  thumbnailFromTo: string; // {from}, {to}
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

export interface HomeFeature {
  title: string;
  description: string;
  points: string[];
}

export interface HomeDictionary {
  metadata: PageMetadata;
  hero: {
    title: string;
    subtitle: string;
    ctaImages: string;
    ctaVideos: string;
    badges: string[];
  };
  features: {
    heading: string;
    subheading: string;
    forImages: string;
    forVideos: string;
    optimize: HomeFeature;
    resize: HomeFeature;
    convert: HomeFeature;
    thumbnail: HomeFeature & { cta: string };
  };
  steps: {
    heading: string;
    items: { title: string; description: string }[];
  };
  privacy: { heading: string; description: string; points: string[] };
  popular: { heading: string };
}

export interface NotFoundTranslations {
  heading: string;
  subtitle: string;
}
