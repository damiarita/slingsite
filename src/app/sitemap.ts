import {
  getAllPosts,
  getFolderTranslations,
  getTranslations,
} from '@/content/lib';
import { getPathname } from '@/i18n/navigation';
import { routing, Locale } from '@/i18n/routing';
import { withDefault } from '@/utils/urls';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
const sitemapPathnames = [
  '/image/',
  '/video/',
  '/subscribe/',
  '/content/[...slugs]',
] as const satisfies readonly Omit<keyof typeof routing.pathnames, '/home/'>[];

export default function sitemap(): MetadataRoute.Sitemap {
  const urlSets: { urls: Record<Locale, string>; lastModified: Date }[] =
    sitemapPathnames.flatMap(function (pathname) {
      switch (pathname) {
        case '/image/':
        case '/video/':
        case '/subscribe/':
          return {
            lastModified: new Date(),
            urls: routing.locales.reduce(
              (acc, locale) => {
                acc[locale] = getPathname({ href: pathname, locale: locale });
                return acc;
              },
              {} as Record<Locale, string>,
            ),
          };
        case '/content/[...slugs]': {
          const postsUrls = [] as {
            urls: Record<Locale, string>;
            lastModified: Date;
          }[];
          const donePostIds = new Set<string>();
          getAllPosts().forEach(function (post) {
            if (donePostIds.has(post.id)) return;
            donePostIds.add(post.id);
            const translations = getTranslations(post);
            postsUrls.push({
              lastModified: new Date(post.publicationDate),
              urls: routing.locales.reduce(
                (acc, locale) => {
                  const translation = translations[locale];
                  if (translation) {
                    acc[locale] = getPathname({
                      href: {
                        pathname: '/content/[...slugs]',
                        params: { slugs: translation.slugPath },
                      },
                      locale: locale,
                    });
                  }
                  return acc;
                },
                {} as Record<Locale, string>,
              ),
            });
          });
          const seenFolders = new Set<string>();
          const folders = [] as Record<Locale, string>[];
          getAllPosts().forEach(function (post) {
            if (post.pathPrefix !== '' && !seenFolders.has(post.pathPrefix)) {
              const translations = getFolderTranslations(
                post.pathPrefix,
                post.locale,
              );
              Object.values(translations).forEach((folder) =>
                seenFolders.add(folder),
              );
              folders.push(translations);
            }
          });
          const foldersUrls = folders.map(function (translations) {
            return {
              lastModified: new Date(),
              urls: routing.locales.reduce(
                (acc, locale) => {
                  const translation = translations[locale];
                  if (translation) {
                    acc[locale] = getPathname({
                      href: {
                        pathname: '/content/[...slugs]',
                        params: { slugs: [translation] },
                      },
                      locale: locale,
                    });
                  }
                  return acc;
                },
                {} as Record<Locale, string>,
              ),
            };
          });
          return [...postsUrls, ...foldersUrls];
        }
        default:
          const _exhaustiveCheck: never = pathname;
          return [];
      }
    });
  return urlSets.flatMap(function (urlSet) {
    return routing.locales.map(function (locale) {
      return {
        url: urlSet.urls[locale],
        lastModified: urlSet.lastModified,
        alternates: { languages: withDefault(urlSet.urls) },
      };
    });
  });
}
