import {
  getFolderTranslations,
  getPostOfId,
  getTranslations,
} from '@/content/lib';
import { Locale, locales } from '@/i18n/lib';
import { Post } from 'contentlayer/generated';

export const pageTypes = ['image', 'suscribe', 'video'] as const;
export type PageType = (typeof pageTypes)[number];

const pagePaths: Record<PageType, string> = {
  image: 'image',
  suscribe: 'suscribe',
  video: 'video',
};

export const getUrl = (
  locale: Locale,
  pageType: PageType,
  queryParams?: string,
): string => {
  const path = pagePaths[pageType];
  return `/${locale}/${path}/${queryParams || ''}`;
};

export const getUrlsByLocale = (pageType: PageType): Record<Locale, string> =>
  locales.reduce(
    function (acc, locale) {
      acc[locale] = getUrl(locale, pageType);
      return acc;
    },
    {} as Record<Locale, string>,
  );

export function getPostUrl(post: Post): string;
export function getPostUrl(id: string, locale: Locale): string;
export function getPostUrl(postOrId: Post | string, locale?: Locale): string {
  const post =
    typeof postOrId === 'string' && locale
      ? getPostOfId(postOrId, locale)
      : (postOrId as Post);
  if (!post) throw new Error('Post not found');
  return `/${post.locale}/${post.fullSlug}/`;
}

export const getPostUrlsByLocale = (post: Post): Record<Locale, string> => {
  return Object.entries(getTranslations(post)).reduce(
    function (acc, [locale, post]) {
      acc[locale as Locale] = getPostUrl(post);
      return acc;
    },
    {} as Record<Locale, string>,
  );
};

export function getFolderUrl(folder: string, locale: Locale): string {
  return `/${locale}/${folder}/`;
}

export function getFolderUrlsByLocale(
  folder: string,
  currentLocale: Locale,
): Record<Locale, string> {
  const folderTranslations = getFolderTranslations(folder, currentLocale);

  return Object.entries(folderTranslations).reduce(
    (acc, [locale, translatedFolder]) => {
      acc[locale as Locale] = getFolderUrl(translatedFolder, locale as Locale);
      return acc;
    },
    {} as Record<Locale, string>,
  );
}
