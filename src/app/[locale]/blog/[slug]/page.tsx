import { getBlogDictionary, Locale } from '@/i18n/lib';
import { getAllPosts, getPostByFullSlug } from '@/content/lib';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostUrl, getPostUrlsByLocale } from '@/utils/urls';
import { PostPageContent } from '@/components/post-page';

type Props = { slug: string; locale: Locale };

export function generateStaticParams(): Props[] {
  return getAllPosts()
    .filter((post) => post.pathPrefix === 'blog') // Only blog posts
    .map((post) => ({
      slug: post.slug,
      locale: post.locale,
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Props>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostByFullSlug(`blog/${slug}`, locale);
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
  const { slug, locale } = await params;
  const post = getPostByFullSlug(`blog/${slug}`, locale);
  if (!post) notFound();
  const translations = await getBlogDictionary(locale);
  return (
    <PostPageContent post={post} locale={locale} translations={translations} />
  );
}
