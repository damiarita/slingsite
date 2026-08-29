'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Locale, routing } from '@/i18n/routing';
import { getPathname, usePathname } from '@/i18n/navigation';
import { getFolderTranslations, getPost, getTranslations } from '@/content/lib';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

export default function LanguageSelector({
  currentLocale,
}: {
  currentLocale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const layoutSegments = useSelectedLayoutSegments();

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

  function getUrls(
    pathname: ReturnType<typeof usePathname>,
    layoutSegments: string[],
  ): Record<Locale, string> {
    switch (pathname) {
      case '/home/':
      case '/image/':
      case '/video/':
      case '/subscribe/':
        return routing.locales.reduce(
          (acc, locale) => {
            acc[locale] = getPathname({ href: pathname, locale: locale });
            return acc;
          },
          {} as Record<Locale, string>,
        );
      case '/content/[...slugs]': {
        const slug = layoutSegments[layoutSegments.length - 1];
        const post = getPost(slug, currentLocale);
        if (post) {
          const translations = getTranslations(post);
          return routing.locales.reduce(
            (acc, locale) => {
              const translation = translations[locale];
              if (translation) {
                acc[locale] = getPathname({
                  href: {
                    pathname: '/content/[...slugs]',
                    params: { slugs: translation.slugPath },
                  },
                  locale: locale,
                });
              }
              return acc;
            },
            {} as Record<Locale, string>,
          );
        }
        const translations = getFolderTranslations(slug, currentLocale);
        return routing.locales.reduce(
          (acc, locale) => {
            const translation = translations[locale];
            if (translation) {
              acc[locale] = getPathname({
                href: {
                  pathname: '/content/[...slugs]',
                  params: { slugs: [translation] },
                },
                locale: locale,
              });
            }
            return acc;
          },
          {} as Record<Locale, string>,
        );
      }
      default: {
        const _exhaustiveCheck: never = pathname;
        return _exhaustiveCheck;
      }
    }
  }

  const urls = useMemo(
    () => getUrls(pathname, layoutSegments),
    [pathname, layoutSegments],
  );

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="language-selector-menu"
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

      {/* Always rendered — even while "closed" — so every language link is
         present in the static HTML for crawlers. Open/closed is expressed
         with CSS (opacity/scale/pointer-events) plus aria-hidden/inert,
         never by adding/removing the links from the DOM. */}
      <div
        id="language-selector-menu"
        className={`absolute left-0 mt-1 w-full bg-white rounded-md shadow-md z-50 border border-gray-300 origin-top transition-all duration-150 ${
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <ul className="py-1" role="menu">
          {(Object.entries(urls) as [Locale, string][]).map(([locale, url]) => (
            <li key={locale} role="none">
              <Link
                href={url}
                hrefLang={locale}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 text-sm transition-colors ${
                  locale === currentLocale
                    ? 'text-gray-900 font-semibold bg-gray-100'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {languageNames[locale] || locale}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
