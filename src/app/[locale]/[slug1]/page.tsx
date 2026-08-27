import { Locale, routing } from '@/i18n/routing';
import { getBlogDictionary } from '@/i18n/requests';
import {
  getAllPosts,
  getPost,
  getPostsByPrefix,
  getTranslations,
} from '@/content/lib';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { withDefault } from '@/utils/urls';
import { PostPageContent } from '@/components/post-page';
import { PostListing } from '@/components/post-listing';
import BaseDatalayer from '@/components/base-datalayer';
import { getPathname } from '@/i18n/navigation';

type Props = { slug1: string; locale: Locale };

export function generateStaticParams(): Props[] {
  const posts = getAllPosts();
  const rootPosts = posts
    .filter((post) => post.pathPrefix === '')
    .map((post) => ({
      slug1: post.slug,
      locale: post.locale,
    }));

  const folders = Array.from(
    new Set(
      posts
        .filter((post) => post.pathPrefix !== '')
        .map((post) => `${post.locale}:${post.pathPrefix}`),
    ),
  ).map((id) => {
    const [locale, slug1] = id.split(':');
    return { locale: locale as Locale, slug1 };
  });

  return [...rootPosts, ...folders];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Props>;
}): Promise<Metadata> {
  const { locale, slug1 } = await params;
  const post = getPost(slug1, locale);
  if (!post) {
    const posts = getPostsByPrefix(slug1, locale);
    if (posts.length > 0) {
      const translations = await getBlogDictionary(locale);
      const postTranslations = getTranslations(posts[0]);
      return {
        title: posts[0].folder || '',
        description: translations.browse_posts_description,
        alternates: {
          canonical: getPathname({
            locale,
            href: {
              pathname: '/content/[...slugs]',
              params: { slugs: [slug1] },
            },
          }),
          languages: withDefault(
            routing.locales.reduce(
              (acc, localeCode) => {
                const translation = postTranslations[localeCode];
                if (translation) {
                  acc[localeCode] = getPathname({
                    locale: localeCode,
                    href: {
                      pathname: '/content/[...slugs]',
                      params: { slugs: [translation.pathPrefix] },
                    },
                  });
                }
                return acc;
              },
              {} as Record<Locale, string>,
            ),
          ),
        },
      };
    }
    return {
      title: '', //The generic 404 takes care of this
      description: '', //The generic 404 takes care of this,
    };
  }
  const translations = getTranslations(post);
  const urls = routing.locales.reduce(
    (acc, locale) => {
      const translation = translations[locale];
      if (translation) {
        acc[locale] = getPathname({
          href: {
            pathname: '/content/[...slugs]',
            params: { slugs: [translation.slugPath] },
          },
          locale: locale,
        });
      }
      return acc;
    },
    {} as Record<Locale, string>,
  );
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: getPathname({
        locale,
        href: {
          pathname: '/content/[...slugs]',
          params: { slugs: post.slugPath },
        },
      }),
      languages: withDefault(urls),
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: getPathname({
        locale,
        href: {
          pathname: '/content/[...slugs]',
          params: { slugs: post.slugPath },
        },
      }),
      siteName: 'SlingSite',
      images: [
        {
          url: '/favicon.ico',
          width: 256,
          height: 256,
          alt: 'SlingSite Logo',
        },
      ],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: post.description,
      images: ['/favicon.ico'],
    },
  };
}

export default async function PostPageWrapper({
  params,
}: {
  params: Promise<Props>;
}) {
  const { slug1, locale } = await params;
  const post = getPost(slug1, locale);

  if (!post) {
    const posts = getPostsByPrefix(slug1, locale);
    if (posts.length === 0) notFound();

    const translations = await getBlogDictionary(locale);
    return (
      <>
        <PostListing
          posts={posts}
          locale={locale}
          title={posts[0].folder || ''}
          translations={translations}
        />
        <BaseDatalayer locale={locale} pageType="postlisting" />
      </>
    );
  }

  const translations = await getBlogDictionary(locale);
  return (
    <>
      <PostPageContent
        post={post}
        locale={locale}
        translations={translations}
      />
      <BaseDatalayer locale={locale} pageType="post" pageSubtype={post.id} />
    </>
  );
}
