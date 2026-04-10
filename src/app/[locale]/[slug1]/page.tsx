import { getBlogDictionary, Locale } from '@/i18n/lib';
import { getAllPosts, getPost, getPostsByPrefix } from '@/content/lib';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  getFolderUrl,
  getFolderUrlsByLocale,
  getPostUrl,
  getPostUrlsByLocale,
} from '@/utils/urls';
import { PostPageContent } from '@/components/post-page';
import { PostListing } from '@/components/post-listing';

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
      return {
        title: slug1.charAt(0).toUpperCase() + slug1.slice(1),
        description: translations.browse_posts_description,
        alternates: {
          canonical: getFolderUrl(slug1, locale),
          languages: getFolderUrlsByLocale(slug1, locale),
        },
      };
    }
    return {
      title: '', //The generic 404 takes care of this
      description: '', //The generic 404 takes care of this,
    };
  }
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: getPostUrl(post),
      languages: getPostUrlsByLocale(post),
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: getPostUrl(post),
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
      <PostListing
        posts={posts}
        locale={locale}
        title={slug1.charAt(0).toUpperCase() + slug1.slice(1)}
        translations={translations}
      />
    );
  }

  const translations = await getBlogDictionary(locale);
  return (
    <PostPageContent post={post} locale={locale} translations={translations} />
  );
}
