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

import { constructMetadata } from '@/utils/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<Props>;
}): Promise<Metadata> {
  const { locale, slug2, slug1 } = await params;
  const post = getPostByFullSlug(`${slug1}/${slug2}`, locale);

  if (!post) {
    return constructMetadata({
      title: 'Post Not Found',
      locale,
      noIndex: true,
    });
  }

  return constructMetadata({
    title: post.title,
    description: post.description,
    locale,
    canonical: getPostUrl(post),
    languages: getPostUrlsByLocale(post),
  });
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
