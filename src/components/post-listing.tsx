import { Locale } from '@/i18n/lib';
import type { Post } from 'contentlayer/generated';
import Link from 'next/link';
import { getPostUrl } from '@/utils/urls';
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
    <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <header className="mb-20 text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
          {title}
        </h1>
      </header>

      <div className="grid gap-12">
        {posts.map((post) => (
          <article
            key={post._id}
            className="group relative flex flex-col md:flex-row gap-8 bg-white p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 border border-gray-100/50"
          >
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest">
                {post.folder && (
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                    {post.folder}
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <time dateTime={post.publicationDate}>
                    {formatDateTime(post.publicationDate, locale)}
                  </time>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {post.readingTime} {translations.read_time}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                <Link href={getPostUrl(post)}>
                  <span className="absolute inset-0" aria-hidden="true" />
                  {post.title}
                </Link>
              </h2>

              <p className="text-gray-600 text-lg line-clamp-2 leading-relaxed">
                {post.description}
              </p>

              <div className="pt-4">
                <span className="inline-flex items-center text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  {translations.read_article}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
