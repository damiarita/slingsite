'use client';
import { Locale } from '@/i18n/lib';
import { getUrl, PageType } from '@/utils/urls';
import { usePathname } from 'next/navigation';

export default function NavLink({
  locale,
  pageType,
  children,
  mobile,
}: {
  locale: Locale;
  pageType: PageType;
  children: React.ReactNode;
  mobile?: boolean;
}) {
  const href = getUrl(locale, pageType);
  const currentUrl = usePathname() || '';
  const currentPath = currentUrl.split('?')[0];
  const isActive = currentPath === href;
  const baseClass = mobile
    ? 'block w-full text-left px-4 py-2'
    : 'inline-flex items-center px-2 py-1';

  return (
    <a
      href={href}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={isActive ? 'true' : undefined}
      tabIndex={isActive ? -1 : undefined}
      className={`text-sm transition-colors ${baseClass} ${isActive ? 'text-blue-800 font-semibold pointer-events-none cursor-default ' + mobile && 'bg-gray-50' : 'text-gray-700 hover:text-blue-800 ' + mobile && 'hover:bg-gray-50'} `}
    >
      {children}
    </a>
  );
}
