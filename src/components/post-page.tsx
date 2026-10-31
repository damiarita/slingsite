import { Locale } from '@/i18n/routing';
import type { Post } from 'contentlayer/generated';
import { Calendar, Clock, Edit3 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Breadcrumbs from './breadcrumbs';
import { buttonClass } from './buttons';
import { BlogTranslations } from '@/i18n/type';
import Script from 'next/script';
import { getPathname } from '@/i18n/navigation';

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
  const url = getPathname({
    locale,
    href: { pathname: '/content/[...slugs]', params: { slugs: post.slugPath } },
  });
  const schema = {
    '@context': 'https://schema.org',
    '@type': post.articleType,
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
      ? [
          {
            label: post.folder,
            href: getPathname({
              locale: post.locale,
              href: {
                pathname: '/content/[...slugs]',
                params: { slugs: [post.pathPrefix] },
              },
            }),
          },
        ]
      : []),
    { label: post.title },
  ];

  return (
    <>
      <Script id="post-schema" type="application/ld+json">
        {JSON.stringify(schema)}
      </Script>

      <div className="page-container py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs
            locale={locale}
            items={breadcrumbItems}
            translations={translations}
          />

          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-rule py-5 text-sm text-muted">
              <div className="flex items-center gap-2">
                <Calendar className="size-4" aria-hidden="true" />
                <span>
                  {translations.published_on}{' '}
                  <time dateTime={post.publicationDate}>
                    {formatDateTime(new Date(post.publicationDate), locale)}
                  </time>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="size-4" aria-hidden="true" />
                <span>
                  {post.readingTime} {translations.read_time}
                </span>
              </div>

              {post.modificationDate !== post.publicationDate && (
                <div className="flex items-center gap-2">
                  <Edit3 className="size-4" aria-hidden="true" />
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

          <article className="prose prose-lg max-w-none prose-blockquote:border-s-4 prose-blockquote:border-accent prose-blockquote:bg-paper-2 prose-blockquote:px-6 prose-blockquote:py-1 prose-img:rounded-card">
            <div dangerouslySetInnerHTML={{ __html: post.body.html }} />
          </article>

          <footer className="mt-16 border-t border-rule pt-8">
            <div className="flex flex-col items-start justify-between gap-6 rounded-card bg-paper-2 p-8 md:flex-row md:items-center">
              <div>
                <h2 className="mb-1 text-title">
                  {translations.enjoyed_question}
                </h2>
                <p className="text-ink-2">{translations.share_or_subscribe}</p>
              </div>
              <Link
                locale={locale}
                href="/subscribe/"
                className={buttonClass('primary')}
              >
                {translations.subscribe}
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
