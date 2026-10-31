// This file defines the strict type for our translation dictionaries,
// ensuring type safety across the application.
import type { PluralForms } from '@/utils/i18n-format';
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
  breadcrumb_label: string;
  home: string;
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
  skipToContent: string;
  theme: { label: string; system: string; light: string; dark: string };
  // The tabs above each tool page's heading
  tools: {
    imageTools: string;
    videoTools: string;
    compress: string;
    convert: string;
    resize: string;
    thumbnail: string;
  };
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
  dropImages: string;
  dropVideos: string;
  browse: string;
  noteImages: string; // {formats}
  noteVideos: string; // {formats}
  sample: string;
  sampleError: string;
  sampleCredit: string; // {photos}
  samplePhoto: string; // {title}, {author}, {license}
}

// The shell shared by every compressor page (files waiting for settings).
export interface CompressorAppDictionary {
  filesNote: string;
  addMore: string;
  removeFile: string; // {name}
  counts: {
    image: PluralForms;
    video: PluralForms;
    file: PluralForms;
    size: PluralForms;
  };
}

type Preset = { label: string; description: string };

// Size settings of the compress pages
export interface SettingsDictionary {
  stepTitle: string;
  whereTitle: string;
  whereNote: string;
  presets: {
    label: string;
    custom: string;
    recommended: Preset;
    blog: Preset;
    hero: Preset;
    grid: Preset;
  };
  columns: { name: string; screen: string; fills: string; output: string };
  fills: { full: string; half: string; third: string; quarter: string };
  exact: string;
  width: string;
  height: string;
  widthOrHeight: string;
  pixels: string;
  outputWide: string; // {px}
  outputTall: string; // {px}
  ofScreen: string; // {fraction}, {screen}
  exactSize: string;
  addSize: string;
  newSizeName: string;
  removeSize: string; // {name}
  preview: {
    title: string;
    legend: string;
    empty: string;
    caption: string; // {name}, {screen}
  };
  problems: {
    noSizes: string;
    noName: string;
    duplicateName: string; // {name}
    duplicateFileName: string; // {name}, {other}
    screenWidth: string;
    exactSize: string;
  };
  start: string; // {files}
  summary: string; // {files}, {sizes}, {formats}, {total}
  withPoster: string; // {formats}, {posterFormats}
  advancedSettings: string;
}

export interface FormatSettingsDictionary {
  stepFormats: string;
  stepSizes: string;
  outputFormats: string;
  formatsNote: string;
  outputSizes: string;
  sizesNote: string;
  advancedSettings: string;
  resize: string;
  resizeDescription: string;
  resized: string;
  converted: string;
  thumbnail: string;
  addSize: string;
  removeSize: string; // {name}
  originalFormat: string;
  originalFormatDescription: string;
  custom: string;
  width: string;
  height: string;
  percent: string;
  sizeLabel: string;
  outputPercent: string; // {percent}
  outputWide: string; // {px}
  outputTall: string; // {px}
  problems: { noFormat: string; sizeValue: string };
  startConversion: string; // {files}
  startResize: string; // {files}
  startThumbnail: string; // {files}
  summary: string; // {files}, {formats}, {total}
  summarySizes: string; // {files}, {sizes}, {formats}, {total}
  ownFormat: string;
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
  title: string;
  downloadAll: string;
  saveToDrive: string;
  totals: string; // {files}, {size}
  keepTabOpen: string;
  sizeColumn: string;
  queued: string;
  working: string;
  failed: string;
  inQueue: string;
  done: string;
  doneWithErrors: string;
  filesReady: string; // {files}
  getHtml: string;
  hideHtml: string;
  markupTitle: string; // {picture}
  copy: string;
  copied: string;
  download: string;
  downloadFile: string; // {name}
  removeFile: string; // {name}
  upload: {
    title: string;
    close: string;
    show: string;
    waiting: string;
    completed: string;
    failed: string; // {message}
  };
}

type HomeTool = { label: string; description: string };

export interface HomeDictionary {
  metadata: PageMetadata;
  hero: { title: string; subtitle: string; checks: string[] };
  chooser: {
    label: string;
    compressImages: HomeTool;
    convertImages: HomeTool;
    resizeImages: HomeTool;
    compressVideos: HomeTool;
    convertVideos: HomeTool;
    resizeVideos: HomeTool;
    videoThumbnail: HomeTool;
  };
  showcase: {
    title: string;
    lead: string;
    screenshotAlt: string;
    caption: string;
    cmsLabel: string;
    cms: string;
    codeLabel: string;
    code: string; // {picture}
  };
  audiences: { title: string; items: { title: string; description: string }[] };
  layouts: { title: string; lead: string; tryIt: string };
  needs: {
    title: string;
    rows: { label: string; value: string; cost?: boolean }[];
  };
  popular: { heading: string };
  band: {
    title: string;
    lead: string;
    ctaImages: string;
    ctaVideos: string;
    phoneAlt: string;
  };
}

export interface NotFoundTranslations {
  heading: string;
  subtitle: string;
}
