'use client';

import { useEffect, useRef, useState } from 'react';
import { Locale, routing } from '@/i18n/routing';
import { getPathname, usePathname } from '@/i18n/navigation';
import { getFolderTranslations, getPost, getTranslations } from '@/content/lib';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSelectedLayoutSegments } from 'next/navigation';

export default function LanguageSelector({
  currentLocale,
}: {
  currentLocale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const layoutSegments = useSelectedLayoutSegments();
  const params = useParams<{ slugs?: string[] }>();

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
                    pathname,
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
                  pathname,
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
      case '/image/format/[[...slugs]]':
      case '/image/resize/[[...slugs]]':
      case '/video/format/[[...slugs]]':
      case '/video/resize/[[...slugs]]':
      case '/video/thumbnail/[[...slugs]]': {
        // Tool slugs are format names, the same in every locale.
        const slugs = params.slugs ?? [];
        return routing.locales.reduce(
          (acc, locale) => {
            acc[locale] = getPathname({
              href: { pathname, params: { slugs } },
              locale: locale,
            });
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

  const urls = getUrls(pathname, layoutSegments);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="language-selector-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 items-center gap-2 rounded-input border border-rule bg-paper px-3 text-sm text-ink transition-colors duration-150 hover:bg-paper-3"
      >
        {languageNames[currentLocale]}
        {open ? (
          <ChevronDown className="size-4 text-muted" aria-hidden="true" />
        ) : (
          <ChevronUp className="size-4 text-muted" aria-hidden="true" />
        )}
      </button>

      {/* Always rendered — even while "closed" — so every language link is
         present in the static HTML for crawlers. Open/closed is expressed
         with CSS (opacity/scale/pointer-events) plus aria-hidden/inert,
         never by adding/removing the links from the DOM. It opens upwards:
         the selector sits at the bottom of the footer. */}
      <div
        id="language-selector-menu"
        className={`absolute end-0 bottom-full z-50 mb-1 min-w-full origin-bottom rounded-card border border-rule bg-paper p-1 shadow-[0_16px_40px_-16px_var(--color-scrim)] transition-[opacity,transform] duration-150 ${
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <ul role="menu">
          {(Object.entries(urls) as [Locale, string][]).map(([locale, url]) => (
            <li key={locale} role="none">
              <Link
                href={url}
                hrefLang={locale}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`flex min-h-10 items-center rounded-[4px] px-3 text-sm whitespace-nowrap no-underline transition-colors duration-150 ${
                  locale === currentLocale
                    ? 'bg-paper-2 font-semibold text-ink'
                    : 'text-ink-2 hover:bg-paper-2 hover:text-ink'
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
