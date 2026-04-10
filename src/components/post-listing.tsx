'use client';

import { Locale } from '@/i18n/lib';
import type { Post } from 'contentlayer/generated';
import Link from 'next/link';
import { getPostUrl } from '@/utils/urls';

import { BlogTranslations } from '@/i18n/type';

interface PostListingProps {
  posts: Post[];
  locale: Locale;
  title: string;
  translations: BlogTranslations;
}

const formatDateTime = (dt: string, locale: Locale): string =>
  new Date(dt).toLocaleString(locale, {
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
    <div className="max-w-4xl mx-auto py-12 px-4">
      <header className="mb-16 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          {title}
        </h1>
      </header>

      <div className="grid gap-10">
        {posts.map((post) => (
          <article
            key={post._id}
            className="group relative bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100"
          >
            <div className="flex flex-col h-full">
              <h2 className="text-3xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-4 leading-tight">
                <Link href={getPostUrl(post)}>
                  <span className="absolute inset-0" aria-hidden="true" />
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 text-lg line-clamp-2 mb-8 flex-grow leading-relaxed">
                {post.description}
              </p>
              <div className="flex items-center gap-3 mb-4">
                <time
                  dateTime={post.publicationDate}
                  className="text-sm font-medium text-gray-400"
                >
                  {formatDateTime(post.publicationDate, locale)}
                </time>
              </div>
            </div>
            {/* Subtle decorative element */}
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors duration-500"></div>
          </article>
        ))}
      </div>
    </div>
  );
}
