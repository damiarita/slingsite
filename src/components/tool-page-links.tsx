import { ArrowRight, FileImage, FileVideo } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { FormatLinksDictionary } from '@/i18n/type';
import type { CompressionInput } from '@/types/compressor';
import {
  type Tool,
  type ToolPage,
  formatLabel,
  getToolPathname,
  getToolPages,
  inputFormats,
} from '@/utils/tool-pages';

const cardClassName =
  'group flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50/50';

// Internal links to every child page of a tool, shown under the app on the
// base page only. Plain links (no JS) so crawlers follow them. Deliberately
// low-key: the upload box above is the page's main action.
export default function ToolPageLinks({
  tool,
  type,
  locale,
  translation,
}: {
  tool: Tool;
  type: CompressionInput;
  locale: Locale;
  translation: FormatLinksDictionary;
}) {
  const pages = getToolPages(tool, type).filter((page) => page.slug);
  const Icon = type === 'image' ? FileImage : FileVideo;
  const href = (page: ToolPage) => ({
    pathname: getToolPathname(tool, type),
    params: { slugs: [page.slug!] },
  });
  const t = translation;
  const copy = {
    format: {
      heading: type === 'image' ? t.imageHeading : t.videoHeading,
      to: type === 'image' ? t.anyImageTo : t.anyVideoTo,
      from: '{from}',
      fromTo: t.fromTo,
    },
    resize: {
      heading: type === 'image' ? t.resizeImageHeading : t.resizeVideoHeading,
      to: t.resize.replace('{format}', '{to}'),
      from: '{from}',
      fromTo: t.fromTo,
    },
    thumbnail: {
      heading: t.thumbnailHeading,
      to: t.thumbnailTo,
      from: t.thumbnailFrom,
      fromTo: t.thumbnailFromTo,
    },
  }[tool];

  // Cards: "Any image to X" (format, thumbnail) or "Resize X" (resize)
  const cardPages = pages.filter((page) => !page.source);
  // Chips: one card per source format, with a chip per target
  const hasSourcePages = pages.some((page) => page.source);

  return (
    <nav className="max-w-4xl mx-auto px-4 pt-12">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        {copy.heading}
      </h2>

      <div
        className={`grid grid-cols-1 gap-3 mb-4 ${cardPages.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}
      >
        {cardPages.map((page) => (
          <Link
            key={page.slug}
            locale={locale}
            href={href(page)}
            className={cardClassName}
          >
            <span className="flex items-center text-sm text-gray-600">
              <Icon
                className="w-4 h-4 me-2 text-gray-400 group-hover:text-blue-600"
                aria-hidden="true"
              />
              {copy.to.replace('{to}', formatLabel(page.destination!))}
            </span>
            <ArrowRight
              className="w-4 h-4 text-gray-300 transition-transform group-hover:text-blue-600 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>

      {hasSourcePages && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {inputFormats[type].map((source) => {
            const from = formatLabel(source);
            // Thumbnail pages also have a "<source>" page: the source name
            // links to it.
            const sourcePage = pages.find(
              (page) => page.source === source && !page.destination,
            );
            return (
              <div
                key={source}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                {sourcePage ? (
                  <Link
                    locale={locale}
                    href={href(sourcePage)}
                    className="me-1 text-sm font-semibold text-gray-700 hover:text-blue-800"
                  >
                    {copy.from.replace('{from}', from)}
                  </Link>
                ) : (
                  <span className="me-1 text-sm font-semibold text-gray-700">
                    {from}
                  </span>
                )}
                <ul className="flex flex-wrap gap-1.5">
                  {pages
                    .filter(
                      (page) => page.source === source && page.destination,
                    )
                    .map((page) => {
                      const to = formatLabel(page.destination!);
                      return (
                        <li key={page.slug}>
                          <Link
                            locale={locale}
                            href={href(page)}
                            className="inline-flex items-center rounded-md px-2 py-1 text-sm text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-900"
                          >
                            {/* Full phrase for crawlers and screen readers */}
                            <span className="sr-only">
                              {copy.fromTo
                                .replace('{from}', from)
                                .replace('{to}', to)}
                            </span>
                            <ArrowRight
                              className="w-3.5 h-3.5 me-1 text-gray-400 rtl:rotate-180"
                              aria-hidden="true"
                            />
                            <span aria-hidden="true">{to}</span>
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </nav>
  );
}
