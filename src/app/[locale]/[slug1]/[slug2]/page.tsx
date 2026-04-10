import { getBlogDictionary, Locale } from '@/i18n/lib';
import { getAllPosts, getPostByFullSlug } from '@/content/lib';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostUrl, getPostUrlsByLocale } from '@/utils/urls';
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

export async function generateMetadata({
  params,
}: {
  params: Promise<Props>;
}): Promise<Metadata> {
  const { locale, slug2, slug1 } = await params;
  const post = getPostByFullSlug(`${slug1}/${slug2}`, locale);
  if (!post) {
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

export default async function BlogPostPageWrapper({
  params,
}: {
  params: Promise<Props>;
}) {
  const { slug2, locale, slug1 } = await params;
  const post = getPostByFullSlug(`${slug1}/${slug2}`, locale);
  if (!post) notFound();
  const translations = await getBlogDictionary(locale);
  return (
    <PostPageContent post={post} locale={locale} translations={translations} />
  );
}
