import { defineRouting } from 'next-intl/routing';

const locales = ['en', 'es', 'ar', 'de', 'fr', 'it', 'zh'] as const;

export function localeDirection(locale: Locale): 'ltr' | 'rtl' {
  const rtlLocales = ['ar'];
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
  pathnames: {
    '/home/': '/',
    '/image/': '/image/',
    '/image/format/[[...slugs]]': '/image/format/[[...slugs]]',
    '/image/resize/[[...slugs]]': '/image/resize/[[...slugs]]',
    '/video/': '/video/',
    '/video/format/[[...slugs]]': '/video/format/[[...slugs]]',
    '/video/resize/[[...slugs]]': '/video/resize/[[...slugs]]',
    '/video/thumbnail/[[...slugs]]': '/video/thumbnail/[[...slugs]]',
    '/subscribe/': '/subscribe/',
    '/content/[...slugs]': '/[...slugs]',
  },
});
