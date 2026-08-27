'use client';
import { Locale } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { AppHref } from '@/types/nav-bar';

export default function NavLink({
  href,
  locale,
  children,
  onLinkClick,
  mobile,
}: {
  href: AppHref;
  locale: Locale;
  children: React.ReactNode;
  onLinkClick?: () => void;
  mobile?: boolean;
}) {
  const currentPath = usePathname() || '';
  const isActive = currentPath === href;
  const baseClass = mobile
    ? 'block w-full text-left px-4 py-2'
    : 'inline-flex items-center px-2 py-1';

  return (
    <Link
      locale={locale}
      href={href}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={isActive ? 'true' : undefined}
      tabIndex={isActive ? -1 : undefined}
      className={`text-sm transition-colors ${baseClass} ${isActive ? 'text-blue-800 font-semibold pointer-events-none cursor-default ' + mobile && 'bg-gray-50' : 'text-gray-700 hover:text-blue-800 ' + mobile && 'hover:bg-gray-50'} `}
      onClick={() => {
        if (onLinkClick) onLinkClick();
      }}
    >
      {children}
    </Link>
  );
}
