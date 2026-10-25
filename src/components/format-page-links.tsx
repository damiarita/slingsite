import { ArrowRight, FileImage, FileVideo } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { FormatLinksDictionary } from '@/i18n/type';
import type { CompressionInput } from '@/types/compressor';
import {
  type FormatPage,
  formatLabel,
  formatPagePathnames,
  getFormatPages,
  inputFormats,
} from '@/utils/format-pages';

// Internal links to every conversion page of a type, shown under the app on
// the base format page only. Plain links (no JS) so crawlers follow them.
// Deliberately low-key: the upload box above is the page's main action.
export default function FormatPageLinks({
  type,
  locale,
  translation,
}: {
  type: CompressionInput;
  locale: Locale;
  translation: FormatLinksDictionary;
}) {
  const pages = getFormatPages(type).filter((page) => page.slug);
  const anyTo =
    type === 'image' ? translation.anyImageTo : translation.anyVideoTo;
  const Icon = type === 'image' ? FileImage : FileVideo;
  const href = (page: FormatPage) => ({
    pathname: formatPagePathnames[type],
    params: { slugs: [page.slug!] },
  });

  return (
    <nav className="max-w-4xl mx-auto px-4 pt-12">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        {type === 'image' ? translation.imageHeading : translation.videoHeading}
      </h2>

      {/* "Any image to X": one card per output format */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {pages
          .filter((page) => !page.source)
          .map((page) => (
            <Link
              key={page.slug}
              locale={locale}
              href={href(page)}
              className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50/50"
            >
              <span className="flex items-center text-sm text-gray-600">
                <Icon
                  className="w-4 h-4 me-2 text-gray-400 group-hover:text-blue-600"
                  aria-hidden="true"
                />
                {anyTo.replace('{to}', formatLabel(page.destination!))}
              </span>
              <ArrowRight
                className="w-4 h-4 text-gray-300 transition-transform group-hover:text-blue-600 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ))}
      </div>

      {/* One card per source format, with a chip per target */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {inputFormats[type].map((source) => (
          <div
            key={source}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <span className="me-1 text-sm font-semibold text-gray-700">
              {formatLabel(source)}
            </span>
            <ul className="flex flex-wrap gap-1.5">
              {pages
                .filter((page) => page.source === source)
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
                          {translation.fromTo
                            .replace('{from}', formatLabel(source))
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
        ))}
      </div>
    </nav>
  );
}
