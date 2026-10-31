import { Locale } from '@/i18n/routing';
import type { Post } from 'contentlayer/generated';
import { Link } from '@/i18n/navigation';
import { Clock, Calendar, ChevronRight } from 'lucide-react';
import { BlogTranslations } from '@/i18n/type';

interface PostListingProps {
  posts: Post[];
  locale: Locale;
  title: string;
  translations: BlogTranslations;
}

const formatDateTime = (dt: string, locale: Locale): string =>
  new Date(dt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export function PostListing({
  posts,
  locale,
  title,
  translations,
}: PostListingProps) {
  return (
    <div className="page-container py-16 lg:py-24">
      <header className="mb-12">
        <h1 className="max-w-[20ch] text-display tracking-[-0.022em]">
          {title}
        </h1>
      </header>

      <div className="grid max-w-4xl border-b border-rule">
        {posts.map((post) => (
          <article
            key={post._id}
            className="group relative border-t border-rule py-8"
          >
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                {post.folder && (
                  <span className="rounded-full bg-paper-2 px-3 py-0.5 text-ink-2">
                    {post.folder}
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4" aria-hidden="true" />
                  <time dateTime={post.publicationDate}>
                    {formatDateTime(post.publicationDate, locale)}
                  </time>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4" aria-hidden="true" />
                  <span>
                    {post.readingTime} {translations.read_time}
                  </span>
                </div>
              </div>

              <h2 className="text-title transition-colors duration-150 group-hover:text-accent-deep">
                <Link
                  locale={locale}
                  href={{
                    pathname: '/content/[...slugs]',
                    params: { slugs: post.slugPath },
                  }}
                >
                  <span className="absolute inset-0" aria-hidden="true" />
                  {post.title}
                </Link>
              </h2>

              <p className="line-clamp-2 max-w-[65ch] text-ink-2">
                {post.description}
              </p>

              <div>
                <Link
                  locale={locale}
                  href={{
                    pathname: '/content/[...slugs]',
                    params: { slugs: post.slugPath },
                  }}
                  className="relative inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent-deep"
                >
                  {translations.read_article}
                  <ChevronRight
                    className="size-4 rtl:rotate-180"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
