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
    '/video/': '/video/',
    '/subscribe/': '/subscribe/',
    '/content/[...slugs]': '/[...slugs]',
  },
});
