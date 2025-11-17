'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Locale } from '@/i18n/lib';
import { usePathname } from 'next/navigation';
import {
  getPostUrl,
  getPostUrlsByLocale,
  getUrl,
  getUrlsByLocale,
  pageTypes,
} from '@/utils/urls';
import { getAllPosts } from '@/content/lib';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function LanguageSelector({
  currentLocale,
}: {
  currentLocale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const path = usePathname();

  const currentPageType = useMemo(() => {
    if (!path) return;
    for (const pageType of pageTypes) {
      const expectedPath = getUrl(currentLocale, pageType);
      if (expectedPath === path) {
        return pageType;
      }
    }
    return;
  }, [path, currentLocale]);

  const currentPost = useMemo(() => {
    if (!path) return;
    for (const post of getAllPosts()) {
      const expectedPath = getPostUrl(post.id, currentLocale);
      if (expectedPath === path) {
        return post;
      }
    }
    return;
  }, [path, currentLocale]);

  const languageNames: Record<Locale, string> = {
    en: 'English',
    es: 'Español',
    ar: 'العربية',
    de: 'Deutsch',
    fr: 'Français',
    it: 'Italiano',
    zh: '中文',
  };

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function getUrls(): Record<Locale, string> {
    if (currentPost) {
      return getPostUrlsByLocale(currentPost);
    }
    if (currentPageType) {
      return getUrlsByLocale(currentPageType);
    }
    return getUrlsByLocale('image'); // default to 'image' page type
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
      >
        {languageNames[currentLocale]}
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-1 w-full bg-white rounded-md shadow-md z-50 border border-gray-300">
          <ul className="py-1">
            {(Object.entries(getUrls()) as [Locale, string][]).map(
              ([locale, url]) => (
                <li key={locale}>
                  <a
                    href={url}
                    hrefLang={locale}
                    onClick={() => setOpen(false)}
                    className={`block px-3 py-2 text-sm transition-colors ${
                      locale === currentLocale
                        ? 'text-gray-900 font-semibold bg-gray-100'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {languageNames[locale] || locale}
                  </a>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
