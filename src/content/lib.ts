import { Locale } from '@/i18n/lib';
import { allPosts, Post } from 'contentlayer/generated';

const sortPosts = (posts: Post[]) => {
  return posts.toSorted((a, b) =>
    a.publicationDate > b.publicationDate ? -1 : 1,
  );
};

export function getAllPosts(sorted = false): Post[] {
  if (sorted) {
    return sortPosts(allPosts);
  }
  return allPosts;
}

export function getPostOfId(id: string, locale: Locale): Post | undefined {
  return allPosts.find((p) => p.id === id && p.locale === locale);
}

export function getPost(slug: string, locale: Locale): Post | undefined {
  return allPosts.find((p) => p.slug === slug && p.locale === locale);
}

export function getPostByFullSlug(
  fullSlug: string,
  locale: Locale,
): Post | undefined {
  return allPosts.find((p) => p.fullSlug === fullSlug && p.locale === locale);
}

export function getPostsByPrefix(
  prefix: string,
  locale: Locale,
  sorted = true,
): Post[] {
  const posts = allPosts.filter(
    (p) => p.pathPrefix === prefix && p.locale === locale,
  );
  return sorted ? sortPosts(posts) : posts;
}

export function getTranslations(post: Post): Record<Locale, Post> {
  return allPosts
    .filter((p) => p.id === post.id)
    .reduce(
      (acc, post) => {
        acc[post.locale] = post;
        return acc;
      },
      {} as Record<Locale, Post>,
    );
}

export function getFolderTranslations(
  folder: string,
  locale: Locale,
): Record<Locale, string> {
  const postsInFolder = getPostsByPrefix(folder, locale);
  const translations: Record<Locale, string> = {} as Record<Locale, string>;

  postsInFolder.forEach((post) => {
    const postTranslations = getTranslations(post);
    Object.entries(postTranslations).forEach(([loc, trans]) => {
      if (!translations[loc as Locale]) {
        translations[loc as Locale] = trans.pathPrefix;
      }
    });
  });

  return translations;
}
