import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { FormatLinksDictionary } from '@/i18n/type';
import type { CompressionInput } from '@/types/compressor';
import {
  formatLabel,
  formatPagePathnames,
  getFormatPages,
  inputFormats,
} from '@/utils/format-pages';

// Internal links to every conversion page of a type, shown under the app on
// the base format page only.
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
  const groups = [
    pages.filter((page) => !page.source),
    ...inputFormats[type].map((source) =>
      pages.filter((page) => page.source === source),
    ),
  ];

  return (
    <nav className="max-w-4xl mx-auto px-4 pt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {type === 'image' ? translation.imageHeading : translation.videoHeading}
      </h2>
      {/* One column per group: "any to X" + one per source format */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 ${type === 'image' ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}
      >
        {groups.map((group, i) => (
          <ul key={i} className="space-y-1">
            {group.map((page) => {
              const to = formatLabel(page.destination!);
              const label = page.source
                ? translation.fromTo
                    .replace('{from}', formatLabel(page.source))
                    .replace('{to}', to)
                : anyTo.replace('{to}', to);
              return (
                <li key={page.slug}>
                  <Link
                    locale={locale}
                    href={{
                      pathname: formatPagePathnames[type],
                      params: { slugs: [page.slug!] },
                    }}
                    className="text-sm text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </nav>
  );
}
