import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import type { Locale } from './routing';
import {
  CookieConsentTranslations,
  BlogTranslations,
  PageMetadata,
  CompressionPageSeoTranslations,
  RedirectingTranslations,
  NavBarTranslations,
  FooterTranslations,
  UploadDictionary,
  CompressorAppDictionary,
  SettingsDictionary,
  FormatSettingsDictionary,
  AudioSettingsDictionary,
  FormatLinksDictionary,
  ResultsDictionary,
  NotFoundTranslations,
  HomeDictionary,
} from './type';
import type { Format } from '@/utils/formats';

// Avoid using `requestLocale` here because it can read request headers under the hood
// (via `headers()`) and that forces routes to be dynamic during prerendering.
// For static pre-rendering we derive the locale from route params (app/[locale]) so
// return a static default locale here.
export default getRequestConfig(() => ({
  locale: routing.defaultLocale as Locale,
}));
type DictionaryImporter<T> = Record<Locale, () => Promise<{ default: T }>>;
function createDictionaryGetter<T>(importers: DictionaryImporter<T>) {
  return async (locale: Locale): Promise<T> => {
    const importer = importers[locale] || importers[routing.defaultLocale];
    return (await importer()).default;
  };
}

export const getCookieDictionary =
  createDictionaryGetter<CookieConsentTranslations>({
    ar: () => import('./dictioraries/cookies/ar.json'),
    de: () => import('./dictioraries/cookies/de.json'),
    es: () => import('./dictioraries/cookies/es.json'),
    fr: () => import('./dictioraries/cookies/fr.json'),
    it: () => import('./dictioraries/cookies/it.json'),
    zh: () => import('./dictioraries/cookies/zh.json'),
    en: () => import('./dictioraries/cookies/en.json'),
  });

export const getBlogDictionary = createDictionaryGetter<BlogTranslations>({
  ar: () => import('./dictioraries/blog/ar.json'),
  de: () => import('./dictioraries/blog/de.json'),
  es: () => import('./dictioraries/blog/es.json'),
  fr: () => import('./dictioraries/blog/fr.json'),
  it: () => import('./dictioraries/blog/it.json'),
  zh: () => import('./dictioraries/blog/zh.json'),
  en: () => import('./dictioraries/blog/en.json'),
});

export const getSubscribePageMetadataDictionary =
  createDictionaryGetter<PageMetadata>({
    ar: () => import('./dictioraries/subscribe/metadata/ar.json'),
    de: () => import('./dictioraries/subscribe/metadata/de.json'),
    es: () => import('./dictioraries/subscribe/metadata/es.json'),
    fr: () => import('./dictioraries/subscribe/metadata/fr.json'),
    it: () => import('./dictioraries/subscribe/metadata/it.json'),
    zh: () => import('./dictioraries/subscribe/metadata/zh.json'),
    en: () => import('./dictioraries/subscribe/metadata/en.json'),
  });

export const getVideoPageMetadataDictionary =
  createDictionaryGetter<PageMetadata>({
    ar: () => import('./dictioraries/compression/video/metadata/ar.json'),
    de: () => import('./dictioraries/compression/video/metadata/de.json'),
    es: () => import('./dictioraries/compression/video/metadata/es.json'),
    fr: () => import('./dictioraries/compression/video/metadata/fr.json'),
    it: () => import('./dictioraries/compression/video/metadata/it.json'),
    zh: () => import('./dictioraries/compression/video/metadata/zh.json'),
    en: () => import('./dictioraries/compression/video/metadata/en.json'),
  });
export const getImagePageMetadataDictionary =
  createDictionaryGetter<PageMetadata>({
    ar: () => import('./dictioraries/compression/image/metadata/ar.json'),
    de: () => import('./dictioraries/compression/image/metadata/de.json'),
    es: () => import('./dictioraries/compression/image/metadata/es.json'),
    fr: () => import('./dictioraries/compression/image/metadata/fr.json'),
    it: () => import('./dictioraries/compression/image/metadata/it.json'),
    zh: () => import('./dictioraries/compression/image/metadata/zh.json'),
    en: () => import('./dictioraries/compression/image/metadata/en.json'),
  });
export const getImagePageSeoDictionary =
  createDictionaryGetter<CompressionPageSeoTranslations>({
    ar: () => import('./dictioraries/compression/image/seo/ar.json'),
    de: () => import('./dictioraries/compression/image/seo/de.json'),
    es: () => import('./dictioraries/compression/image/seo/es.json'),
    fr: () => import('./dictioraries/compression/image/seo/fr.json'),
    it: () => import('./dictioraries/compression/image/seo/it.json'),
    zh: () => import('./dictioraries/compression/image/seo/zh.json'),
    en: () => import('./dictioraries/compression/image/seo/en.json'),
  });
export const getVideoPageSeoDictionary =
  createDictionaryGetter<CompressionPageSeoTranslations>({
    ar: () => import('./dictioraries/compression/video/seo/ar.json'),
    de: () => import('./dictioraries/compression/video/seo/de.json'),
    es: () => import('./dictioraries/compression/video/seo/es.json'),
    fr: () => import('./dictioraries/compression/video/seo/fr.json'),
    it: () => import('./dictioraries/compression/video/seo/it.json'),
    zh: () => import('./dictioraries/compression/video/seo/zh.json'),
    en: () => import('./dictioraries/compression/video/seo/en.json'),
  });
export const getRedirectionDictionary =
  createDictionaryGetter<RedirectingTranslations>({
    ar: () => import('./dictioraries/redirecter/ar.json'),
    de: () => import('./dictioraries/redirecter/de.json'),
    es: () => import('./dictioraries/redirecter/es.json'),
    fr: () => import('./dictioraries/redirecter/fr.json'),
    it: () => import('./dictioraries/redirecter/it.json'),
    zh: () => import('./dictioraries/redirecter/zh.json'),
    en: () => import('./dictioraries/redirecter/en.json'),
  });

export const getNavBarDictionary = createDictionaryGetter<NavBarTranslations>({
  ar: () => import('./dictioraries/nav-bar/ar.json'),
  de: () => import('./dictioraries/nav-bar/de.json'),
  es: () => import('./dictioraries/nav-bar/es.json'),
  fr: () => import('./dictioraries/nav-bar/fr.json'),
  it: () => import('./dictioraries/nav-bar/it.json'),
  zh: () => import('./dictioraries/nav-bar/zh.json'),
  en: () => import('./dictioraries/nav-bar/en.json'),
});

export const getNotFoundDictionary =
  createDictionaryGetter<NotFoundTranslations>({
    ar: () => import('./dictioraries/not-found/ar.json'),
    de: () => import('./dictioraries/not-found/de.json'),
    es: () => import('./dictioraries/not-found/es.json'),
    fr: () => import('./dictioraries/not-found/fr.json'),
    it: () => import('./dictioraries/not-found/it.json'),
    zh: () => import('./dictioraries/not-found/zh.json'),
    en: () => import('./dictioraries/not-found/en.json'),
  });

export const getFooterDictionary = createDictionaryGetter<FooterTranslations>({
  ar: () => import('./dictioraries/footer/ar.json'),
  de: () => import('./dictioraries/footer/de.json'),
  es: () => import('./dictioraries/footer/es.json'),
  fr: () => import('./dictioraries/footer/fr.json'),
  it: () => import('./dictioraries/footer/it.json'),
  zh: () => import('./dictioraries/footer/zh.json'),
  en: () => import('./dictioraries/footer/en.json'),
});

export const getUploadDictionary = createDictionaryGetter<UploadDictionary>({
  ar: () => import('./dictioraries/upload/ar.json'),
  de: () => import('./dictioraries/upload/de.json'),
  es: () => import('./dictioraries/upload/es.json'),
  fr: () => import('./dictioraries/upload/fr.json'),
  it: () => import('./dictioraries/upload/it.json'),
  zh: () => import('./dictioraries/upload/zh.json'),
  en: () => import('./dictioraries/upload/en.json'),
});

export const getCompressorAppDictionary =
  createDictionaryGetter<CompressorAppDictionary>({
    ar: () => import('./dictioraries/compressor-app/ar.json'),
    de: () => import('./dictioraries/compressor-app/de.json'),
    es: () => import('./dictioraries/compressor-app/es.json'),
    fr: () => import('./dictioraries/compressor-app/fr.json'),
    it: () => import('./dictioraries/compressor-app/it.json'),
    zh: () => import('./dictioraries/compressor-app/zh.json'),
    en: () => import('./dictioraries/compressor-app/en.json'),
  });

export const getSettingsDictionary = createDictionaryGetter<SettingsDictionary>(
  {
    ar: () => import('./dictioraries/settings/ar.json'),
    de: () => import('./dictioraries/settings/de.json'),
    es: () => import('./dictioraries/settings/es.json'),
    fr: () => import('./dictioraries/settings/fr.json'),
    it: () => import('./dictioraries/settings/it.json'),
    zh: () => import('./dictioraries/settings/zh.json'),
    en: () => import('./dictioraries/settings/en.json'),
  },
);
export const getFormatSettingsDictionary =
  createDictionaryGetter<FormatSettingsDictionary>({
    ar: () => import('./dictioraries/format-settings/ar.json'),
    de: () => import('./dictioraries/format-settings/de.json'),
    es: () => import('./dictioraries/format-settings/es.json'),
    fr: () => import('./dictioraries/format-settings/fr.json'),
    it: () => import('./dictioraries/format-settings/it.json'),
    zh: () => import('./dictioraries/format-settings/zh.json'),
    en: () => import('./dictioraries/format-settings/en.json'),
  });
export const getAudioSettingsDictionary =
  createDictionaryGetter<AudioSettingsDictionary>({
    ar: () => import('./dictioraries/audio-settings/ar.json'),
    de: () => import('./dictioraries/audio-settings/de.json'),
    es: () => import('./dictioraries/audio-settings/es.json'),
    fr: () => import('./dictioraries/audio-settings/fr.json'),
    it: () => import('./dictioraries/audio-settings/it.json'),
    zh: () => import('./dictioraries/audio-settings/zh.json'),
    en: () => import('./dictioraries/audio-settings/en.json'),
  });
export const getFormatsDictionary = createDictionaryGetter<
  Record<Format, string>
>({
  ar: () => import('./dictioraries/formats/ar.json'),
  de: () => import('./dictioraries/formats/de.json'),
  es: () => import('./dictioraries/formats/es.json'),
  fr: () => import('./dictioraries/formats/fr.json'),
  it: () => import('./dictioraries/formats/it.json'),
  zh: () => import('./dictioraries/formats/zh.json'),
  en: () => import('./dictioraries/formats/en.json'),
});
export const getImageFormatPageMetadataDictionary =
  createDictionaryGetter<PageMetadata>({
    ar: () => import('./dictioraries/format/image/metadata/ar.json'),
    de: () => import('./dictioraries/format/image/metadata/de.json'),
    es: () => import('./dictioraries/format/image/metadata/es.json'),
    fr: () => import('./dictioraries/format/image/metadata/fr.json'),
    it: () => import('./dictioraries/format/image/metadata/it.json'),
    zh: () => import('./dictioraries/format/image/metadata/zh.json'),
    en: () => import('./dictioraries/format/image/metadata/en.json'),
  });
export const getImageFormatPageSeoDictionary =
  createDictionaryGetter<CompressionPageSeoTranslations>({
    ar: () => import('./dictioraries/format/image/seo/ar.json'),
    de: () => import('./dictioraries/format/image/seo/de.json'),
    es: () => import('./dictioraries/format/image/seo/es.json'),
    fr: () => import('./dictioraries/format/image/seo/fr.json'),
    it: () => import('./dictioraries/format/image/seo/it.json'),
    zh: () => import('./dictioraries/format/image/seo/zh.json'),
    en: () => import('./dictioraries/format/image/seo/en.json'),
  });
export const getVideoFormatPageMetadataDictionary =
  createDictionaryGetter<PageMetadata>({
    ar: () => import('./dictioraries/format/video/metadata/ar.json'),
    de: () => import('./dictioraries/format/video/metadata/de.json'),
    es: () => import('./dictioraries/format/video/metadata/es.json'),
    fr: () => import('./dictioraries/format/video/metadata/fr.json'),
    it: () => import('./dictioraries/format/video/metadata/it.json'),
    zh: () => import('./dictioraries/format/video/metadata/zh.json'),
    en: () => import('./dictioraries/format/video/metadata/en.json'),
  });
export const getVideoFormatPageSeoDictionary =
  createDictionaryGetter<CompressionPageSeoTranslations>({
    ar: () => import('./dictioraries/format/video/seo/ar.json'),
    de: () => import('./dictioraries/format/video/seo/de.json'),
    es: () => import('./dictioraries/format/video/seo/es.json'),
    fr: () => import('./dictioraries/format/video/seo/fr.json'),
    it: () => import('./dictioraries/format/video/seo/it.json'),
    zh: () => import('./dictioraries/format/video/seo/zh.json'),
    en: () => import('./dictioraries/format/video/seo/en.json'),
  });
export const getFormatLinksDictionary =
  createDictionaryGetter<FormatLinksDictionary>({
    ar: () => import('./dictioraries/format-links/ar.json'),
    de: () => import('./dictioraries/format-links/de.json'),
    es: () => import('./dictioraries/format-links/es.json'),
    fr: () => import('./dictioraries/format-links/fr.json'),
    it: () => import('./dictioraries/format-links/it.json'),
    zh: () => import('./dictioraries/format-links/zh.json'),
    en: () => import('./dictioraries/format-links/en.json'),
  });
export const getResultDictionary = createDictionaryGetter<ResultsDictionary>({
  ar: () => import('./dictioraries/result/ar.json'),
  de: () => import('./dictioraries/result/de.json'),
  es: () => import('./dictioraries/result/es.json'),
  fr: () => import('./dictioraries/result/fr.json'),
  it: () => import('./dictioraries/result/it.json'),
  zh: () => import('./dictioraries/result/zh.json'),
  en: () => import('./dictioraries/result/en.json'),
});
export const getDevicesDictionary = createDictionaryGetter<
  Record<'mobile' | 'tablet' | 'desktop', string>
>({
  ar: () => import('./dictioraries/devices/ar.json'),
  de: () => import('./dictioraries/devices/de.json'),
  es: () => import('./dictioraries/devices/es.json'),
  fr: () => import('./dictioraries/devices/fr.json'),
  it: () => import('./dictioraries/devices/it.json'),
  zh: () => import('./dictioraries/devices/zh.json'),
  en: () => import('./dictioraries/devices/en.json'),
});
export const getHomeDictionary = createDictionaryGetter<HomeDictionary>({
  ar: () => import('./dictioraries/home/ar.json'),
  de: () => import('./dictioraries/home/de.json'),
  es: () => import('./dictioraries/home/es.json'),
  fr: () => import('./dictioraries/home/fr.json'),
  it: () => import('./dictioraries/home/it.json'),
  zh: () => import('./dictioraries/home/zh.json'),
  en: () => import('./dictioraries/home/en.json'),
});
