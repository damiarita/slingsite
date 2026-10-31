import { Link as IntlLink } from '@/i18n/navigation';
import { Locale } from '@/i18n/routing';
import type { BlogTranslations } from '@/i18n/type';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  locale: Locale;
  items: BreadcrumbItem[];
  translations: Pick<BlogTranslations, 'breadcrumb_label' | 'home'>;
}

export default function Breadcrumbs({
  locale,
  items,
  translations,
}: BreadcrumbsProps) {
  return (
    <nav className="mb-8 flex" aria-label={translations.breadcrumb_label}>
      <ol className="inline-flex flex-wrap items-center gap-1 text-sm text-muted md:gap-2">
        <li className="inline-flex items-center">
          <IntlLink
            locale={locale}
            href={{ pathname: '/home/' }}
            className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-ink"
          >
            <Home className="size-4" aria-hidden="true" />
            <span className="sr-only">{translations.home}</span>
          </IntlLink>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight
              className="size-4 text-dash rtl:rotate-180"
              aria-hidden="true"
            />
            {item.href ? (
              <Link
                href={item.href}
                className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-ink"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className="max-w-[150px] truncate font-semibold text-ink md:max-w-none"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
