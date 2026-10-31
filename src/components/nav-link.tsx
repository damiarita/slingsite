'use client';
import { Locale } from '@/i18n/routing';
import { Link, usePathname } from '@/i18n/navigation';
import { ComponentProps } from 'react';

export type AppHref = ComponentProps<typeof Link>['href'];

// usePathname returns the route template (e.g. '/image/format/[[...slugs]]'),
// so active checks compare against the template of object hrefs too.
export const hrefPathname = (href: AppHref) =>
  typeof href === 'string' ? href : href.pathname;

// A menu entry (dropdown and mobile drawer).
export default function NavLink({
  href,
  locale,
  children,
  onLinkClick,
}: {
  href: AppHref;
  locale: Locale;
  children: React.ReactNode;
  onLinkClick?: () => void;
}) {
  const currentPath = usePathname();
  const isActive = currentPath === hrefPathname(href);

  return (
    <Link
      locale={locale}
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`flex min-h-11 w-full items-center rounded-[4px] px-3 text-sm no-underline transition-colors duration-150 ${
        isActive
          ? 'bg-paper-2 font-semibold text-ink'
          : 'text-ink-2 hover:bg-paper-2 hover:text-ink'
      }`}
      onClick={() => {
        if (onLinkClick) onLinkClick();
      }}
    >
      {children}
    </Link>
  );
}
