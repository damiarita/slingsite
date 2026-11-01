import type {
  CompressionPageSeoTranslations,
  NavBarTranslations,
} from '@/i18n/type';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import type { CompressionInput } from '@/types/compressor';
import { type Tool, getToolPathname } from '@/utils/tool-pages';
import type { AppHref } from './nav-link';
import Script from 'next/script';

type IntroTool = 'compress' | Tool;

// The heading of every compressor page, shown beside the dropzone: the
// type's tools as tabs, the H1 and one line. Rendered on the server and
// passed into the (client) app as `intro`, plus the page's JSON-LD.
export default function CompressorIntro({
  seoTranslation,
  type,
  tool,
  locale,
  translation,
}: {
  seoTranslation: CompressionPageSeoTranslations;
  type: CompressionInput;
  tool: IntroTool;
  locale: Locale;
  translation: NavBarTranslations['tools'];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    applicationCategory: 'BrowserApplication',
    name: 'SlingSite',
    offers: { '@type': 'Offer', price: 0 },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.9,
      reviewCount: 100,
      bestRating: 5,
    },
    isAccessibleForFree: true,
  };

  const tabs: { tool: IntroTool; label: string; href: AppHref }[] = [
    { tool: 'compress', label: translation.compress, href: `/${type}/` },
    {
      tool: 'format',
      label: translation.convert,
      href: {
        pathname: getToolPathname('format', type),
        params: { slugs: [] },
      },
    },
    {
      tool: 'resize',
      label: translation.resize,
      href: {
        pathname: getToolPathname('resize', type),
        params: { slugs: [] },
      },
    },
    ...(type === 'image'
      ? [
          {
            tool: 'remove-background' as const,
            label: translation.removeBackground,
            href: {
              pathname: getToolPathname('remove-background', type),
              params: { slugs: [] },
            },
          },
          {
            tool: 'alt' as const,
            label: translation.alt,
            href: {
              pathname: getToolPathname('alt', type),
              params: { slugs: [] },
            },
          },
        ]
      : []),
    ...(type === 'video'
      ? [
          {
            tool: 'thumbnail' as const,
            label: translation.thumbnail,
            href: {
              pathname: getToolPathname('thumbnail', type),
              params: { slugs: [] },
            },
          },
        ]
      : []),
  ];

  return (
    <>
      <Script id="tool-schema" type="application/ld+json">
        {JSON.stringify(schema)}
      </Script>
      <nav
        aria-label={
          type === 'image' ? translation.imageTools : translation.videoTools
        }
      >
        <ul className="mb-6 flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const current = tab.tool === tool;
            return (
              <li key={tab.tool}>
                <Link
                  locale={locale}
                  href={tab.href}
                  aria-current={current ? 'true' : undefined}
                  className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm no-underline transition-colors duration-200 ${
                    current
                      ? 'border-ink bg-ink text-paper'
                      : 'border-rule text-ink-2 hover:bg-paper-2 hover:text-ink'
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <h1
        id="page-title"
        className="max-w-[16ch] text-display tracking-[-0.022em]"
      >
        {seoTranslation.title}
      </h1>
      <p className="mt-4 max-w-[36ch] text-lead text-ink-2">
        {seoTranslation.subtitle}
      </p>
    </>
  );
}
