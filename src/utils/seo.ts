import { Locale, routing } from '@/i18n/routing';

export const siteUrl = new URL(
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://slingsite.github.io/',
);

// Page paths only. getPathname drops the trailing slash of a locale root
// ("/en"), but the site uses `trailingSlash: true`.
export function withTrailingSlash(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export function toAbsoluteUrl(pathname: string): string {
  return new URL(withTrailingSlash(pathname), siteUrl).toString();
}

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
