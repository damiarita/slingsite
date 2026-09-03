'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from './logo';
import NavLink, { type AppHref } from './nav-link';
import type { Locale } from '@/i18n/routing';
import type { NavBarTranslations } from '@/i18n/type';
import { Link } from '@/i18n/navigation';
export default function NavBar({
  locale,
  translation,
}: {
  locale: Locale;
  translation: NavBarTranslations;
}) {
  const items: { href: AppHref; label: string }[] = [
    { href: '/image/', label: translation.imageCompressor },
    { href: '/video/', label: translation.videoCompressor },
  ];
  const [open, setOpen] = useState(false);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              locale={locale}
              href="/image/"
              className="flex items-center space-x-3"
            >
              <Logo />
              <span className="text-2xl font-bold text-gray-800">
                SlingSite
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden sm:flex space-x-6 text-sm font-medium">
              {items.map((item, i) => (
                <NavLink
                  key={i}
                  locale={locale}
                  href={item.href}
                  onLinkClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile hamburger */}
            <div className="sm:hidden">
              <button
                type="button"
                aria-label={open ? translation.closeMenu : translation.openMenu}
                aria-expanded={open}
                aria-controls="mobile-nav-drawer"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {open ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop. Purely decorative (no indexable content), so it's fine
         for this one to mount/unmount with `open`. */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile nav drawer. Always rendered — even while "closed" — so the
         links are present in the static HTML for crawlers. Open/closed is
         expressed with CSS (transform) plus aria-hidden/inert, never by
         adding/removing the links from the DOM. */}
      <div
        id="mobile-nav-drawer"
        className={`fixed inset-y-0 right-0 z-50 w-72 max-w-[85%] bg-white shadow-xl sm:hidden transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-800">
            {translation.menu}
          </span>
          <button
            type="button"
            aria-label={translation.closeMenu}
            onClick={() => setOpen(false)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="py-2">
          {items.map((item, i) => (
            <NavLink
              key={i}
              locale={locale}
              href={item.href}
              onLinkClick={() => setOpen(false)}
              mobile
            >
              <div className="px-4 py-2">{item.label}</div>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
