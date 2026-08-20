import { getAllPosts } from '@/content/lib';
import { routing, Locale } from '@/i18n/routing';
import {
  getFolderUrl,
  getFolderUrlsByLocale,
  getPostUrl,
  getPostUrlsByLocale,
  getUrl,
  getUrlsByLocale,
  pageTypes,
} from '@/utils/urls';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const dynamicPages = pageTypes.flatMap(function (pageType) {
    return routing.locales.map(function (locale) {
      return {
        url: getUrl(locale, pageType),
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        alternates: {
          languages: getUrlsByLocale(pageType),
        },
      };
    });
  });
  const staticPages = getAllPosts(true).map(function (post) {
    return {
      url: getPostUrl(post),
      lastModified: new Date(post.publicationDate),
      changeFrequency: 'monthly' as const,
      alternates: {
        languages: getPostUrlsByLocale(post),
      },
    };
  });

  const folderPages = Array.from(
    new Set(
      getAllPosts()
        .filter((post) => post.pathPrefix !== '')
        .map((post) => `${post.locale}:${post.pathPrefix}`),
    ),
  ).map((id) => {
    const [locale, folder] = id.split(':');
    return {
      url: getFolderUrl(folder, locale as Locale),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      alternates: {
        languages: getFolderUrlsByLocale(folder, locale as Locale),
      },
    };
  });

  return dynamicPages.concat(folderPages).concat(staticPages);
}
