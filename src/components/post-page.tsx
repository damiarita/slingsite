import { Locale } from '@/i18n/lib';
import { getPostUrl, getPostUrlsByLocale } from '@/utils/urls';
import type { Post } from 'contentlayer/generated';
import { Calendar, Clock, Edit3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Breadcrumbs from './breadcrumbs';
import { BlogTranslations } from '@/i18n/type';

const formatDateTime = (dt: Date, locale: Locale): string =>
  dt.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

interface PostPageProps {
  post: Post;
  locale: Locale;
  translations: BlogTranslations;
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

  const breadcrumbItems = [
    ...(post.folder
      ? [{ label: post.folder, href: `/${locale}/${post.pathPrefix}` }]
      : []),
    { label: post.title },
  ];

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumbs locale={locale} items={breadcrumbItems} />

        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-y border-gray-100 py-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>
                {translations.published_on}{' '}
                <time dateTime={post.publicationDate}>
                  {formatDateTime(new Date(post.publicationDate), locale)}
                </time>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>
                {post.readingTime} {translations.read_time}
              </span>
            </div>

            {post.modificationDate !== post.publicationDate && (
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-500" />
                <span>
                  {translations.last_edited_on}{' '}
                  <time dateTime={post.modificationDate}>
                    {formatDateTime(new Date(post.modificationDate), locale)}
                  </time>
                </span>
              </div>
            )}
          </div>
        </header>

        <article className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-img:rounded-2xl prose-img:shadow-xl">
          <div dangerouslySetInnerHTML={{ __html: post.body.html }} />
        </article>

        <footer className="mt-16 pt-8 border-t border-gray-100">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                {translations.enjoyed_question}
              </h2>
              <p className="text-gray-600">{translations.share_or_subscribe}</p>
            </div>
            <div className="flex gap-4">
              <Link
                href={`/${locale}/suscribe`}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
              >
                {translations.subscribe}
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
