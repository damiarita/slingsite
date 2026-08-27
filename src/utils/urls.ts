import { Locale, routing } from '@/i18n/routing';

export function withDefault(
  urlsByLocale: Record<Locale, string>,
): Record<Locale | 'x-default', string> {
  return Object.entries(urlsByLocale).reduce(
    (acc, [locale, url]) => {
      acc[locale as Locale] = url;
      if (locale === routing.defaultLocale) {
        acc['x-default'] = url;
      }
      return acc;
    },
    {} as Record<Locale | 'x-default', string>,
  );
}
