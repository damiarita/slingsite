export const defaultLocale = 'en';
export const locales = ['en', 'es', 'ar', 'de', 'fr', 'it', 'zh'] as const;
export const rtlLocales = ['ar'];

export type Locale = (typeof locales)[number];

export const localeIsValid = (locale: string) =>
  locales.includes(locale as Locale);
