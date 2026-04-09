'use client';
import { getBlogDictionary, Locale } from '@/i18n/lib';
import { getPost } from '@/content/lib';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostUrl, getPostUrlsByLocale } from '@/utils/urls';
import type { Post } from 'contentlayer/generated';

const formatDateTime = (dt: Date, locale: Locale): string =>
  dt.toLocaleString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

interface PostPageProps {
  post: Post;
  locale: Locale;
  translations: Awaited<ReturnType<typeof getBlogDictionary>>;
}

export function PostPageContent({ post, locale, translations }: PostPageProps) {
  const url = getPostUrl(post);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url: url,
    headline: post.title,
    articleBody: post.text,
    description: post.description,
    datePublished: post.publicationDate,
    dateModified: post.modificationDate,
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div
          dangerouslySetInnerHTML={{ __html: post.body.html }}
          className="pt-6 pb-6 prose prose-lg max-w-4xl mx-auto prose-headings:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-blockquote:border-l-blue-500 prose-li:marker:text-blue-600 prose-hr:border-gray-200"
        />
        <footer>
          <p>
            {translations.publidhed_on}{' '}
            <time dateTime={post.publicationDate}>
              {formatDateTime(new Date(post.publicationDate), locale)}
            </time>
          </p>
          <p>
            {translations.last_edited_on}{' '}
            <time dateTime={post.modificationDate}>
              {formatDateTime(new Date(post.modificationDate), locale)}
            </time>
          </p>
        </footer>
      </article>
    </>
  );
}
