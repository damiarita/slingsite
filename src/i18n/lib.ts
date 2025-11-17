import {
  BlogTranslations,
  CompressionPageSeoTranslations,
  CookieConsentTranslations,
  FooterTranslations,
  NavBarTranslations,
  PageMetadata,
  RedirectingTranslations,
  SettingsDictionary,
  UploadDictionary,
} from './type';

export const defaultLocale = 'en';
export const locales = ['en', 'es', 'ar', 'de', 'fr', 'it', 'zh'] as const;
export const rtlLocales = ['ar'];

export type Locale = (typeof locales)[number];

export const localeIsValid = (locale: string) =>
  locales.includes(locale as Locale);

type DictionaryImporter<T> = Record<Locale, () => Promise<{ default: T }>>;
function createDictionaryGetter<T>(importers: DictionaryImporter<T>) {
  return async (locale: Locale): Promise<T> => {
    const importer = importers[locale] || importers['en'];
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
