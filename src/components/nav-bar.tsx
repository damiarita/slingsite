'use client';

import { useState } from 'react';
import { Logo } from './logo';
import NavLink from './nav-link';
import { Locale } from '@/i18n/lib';
import { getUrl } from '@/utils/urls';
import { NavBarItem } from '@/types/nav-bar';

export default function NavBar({
  locale,
  items,
}: {
  locale: Locale;
  items: NavBarItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <a
          href={getUrl(locale, 'image')}
          className="flex items-center space-x-3"
        >
          <Logo />
          <span className="text-2xl font-bold text-gray-800">SlingSite</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden sm:flex space-x-6 text-sm font-medium">
          {items.map((item) => (
            <NavLink
              key={item.pageType}
              pageType={item.pageType}
              locale={locale}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <div className="sm:hidden">
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="absolute left-0 right-0 top-full sm:hidden z-50">
          <div className="bg-white rounded-b-md shadow-md py-2">
            {items.map((item) => (
              <NavLink
                key={item.pageType}
                pageType={item.pageType}
                locale={locale}
                mobile
              >
                <div className="px-4 py-2">{item.label}</div>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
