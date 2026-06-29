import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Locale } from '@/i18n/lib';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  locale: Locale;
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ locale, items }: BreadcrumbsProps) {
  return (
    <nav className="flex mb-8" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm font-medium text-gray-500">
        <li className="inline-flex items-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center hover:text-blue-600 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-semibold truncate max-w-[150px] md:max-w-none">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
