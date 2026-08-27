import { Locale, routing } from '@/i18n/routing';
import { getBlogDictionary } from '@/i18n/requests';
import { getAllPosts, getPost, getTranslations } from '@/content/lib';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { withDefault } from '@/utils/urls';
import { PostPageContent } from '@/components/post-page';

type Props = { slug2: string; slug1: string; locale: Locale };

export function generateStaticParams(): Props[] {
  return getAllPosts()
    .filter((post) => post.pathPrefix !== '') // Only posts in a subfolder
    .map((post) => ({
      slug2: post.slug,
      slug1: post.pathPrefix,
      locale: post.locale,
    }));
}

import BaseDatalayer from '@/components/base-datalayer';
import { getPathname } from '@/i18n/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<Props>;
}): Promise<Metadata> {
  const { locale, slug2 } = await params;
  const post = getPost(slug2, locale);

  if (!post) {
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
            params: { slugs: translation.slugPath },
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

export default async function BlogPostPageWrapper({
  params,
}: {
  params: Promise<Props>;
}) {
  const { slug2, locale } = await params;
  const post = getPost(slug2, locale);
  if (!post) notFound();
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
