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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {type === 'image' ? translation.imageHeading : translation.videoHeading}
      </h2>

      {/* "Any image to X": one big card per output format */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {pages
          .filter((page) => !page.source)
          .map((page) => (
            <Link
              key={page.slug}
              locale={locale}
              href={href(page)}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Icon
                className="absolute -end-3 -bottom-3 w-20 h-20 text-white/15"
                aria-hidden="true"
              />
              <span className="block text-3xl font-extrabold tracking-tight">
                {formatLabel(page.destination!)}
              </span>
              <span className="mt-1 flex items-center text-sm text-blue-100">
                {anyTo.replace('{to}', formatLabel(page.destination!))}
                <ArrowRight
                  className="w-4 h-4 ms-1 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
      </div>

      {/* One card per source format, with a chip per target */}
      {/* 5 image sources fill 3 columns; 4 video sources look best as 2x2 */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${type === 'image' ? 'lg:grid-cols-3' : ''}`}
      >
        {inputFormats[type].map((source) => (
          <div
            key={source}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center mb-3">
              <span className="inline-flex items-center rounded-md bg-gray-900 px-2.5 py-1 text-sm font-bold text-white">
                <Icon className="w-4 h-4 me-1.5" aria-hidden="true" />
                {formatLabel(source)}
              </span>
            </div>
            <ul className="flex flex-wrap gap-2">
              {pages
                .filter((page) => page.source === source)
                .map((page) => {
                  const to = formatLabel(page.destination!);
                  return (
                    <li key={page.slug}>
                      <Link
                        locale={locale}
                        href={href(page)}
                        className="group inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-100 transition-colors hover:bg-blue-600 hover:text-white hover:ring-blue-600"
                      >
                        {/* Full phrase for crawlers and screen readers */}
                        <span className="sr-only">
                          {translation.fromTo
                            .replace('{from}', formatLabel(source))
                            .replace('{to}', to)}
                        </span>
                        <ArrowRight
                          className="w-3.5 h-3.5 me-1 rtl:rotate-180"
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
