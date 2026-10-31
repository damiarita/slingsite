'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from './logo';
import NavLink from './nav-link';
import NavDropdown from './nav-dropdown';
import ThemeSwitcher from './theme-switcher';
import { getNavGroups } from './nav-groups';
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
  const groups = getNavGroups(translation);
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
      <a
        href="#main"
        className="absolute start-4 -top-24 z-[60] rounded-input bg-ink px-4 py-2 text-paper focus-visible:top-4"
      >
        {translation.skipToContent}
      </a>
      <header className="border-b border-rule bg-paper">
        <div className="page-container flex min-h-16 items-center gap-6">
          <Link
            locale={locale}
            href="/home/"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-[-0.02em] text-ink no-underline"
          >
            <Logo />
            SlingSite
          </Link>

          {/* Desktop nav */}
          <nav className="ms-auto hidden items-center gap-1 sm:flex">
            {groups.map((group) => (
              <NavDropdown key={group.label} group={group} locale={locale} />
            ))}
          </nav>
          <div className="hidden sm:block">
            <ThemeSwitcher translation={translation.theme} />
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav-drawer"
            onClick={() => setOpen((v) => !v)}
            className="ms-auto grid size-11 place-items-center rounded-input text-ink hover:bg-paper-2 sm:hidden"
          >
            {open ? (
              <X className="size-6" aria-hidden="true" />
            ) : (
              <Menu className="size-6" aria-hidden="true" />
            )}
            <span className="sr-only">
              {open ? translation.closeMenu : translation.openMenu}
            </span>
          </button>
        </div>
      </header>

      {/* Backdrop. Purely decorative (no indexable content), so it's fine
         for this one to mount/unmount with `open`. */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-scrim sm:hidden"
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
        className={`fixed inset-y-0 end-0 z-50 flex w-80 max-w-[88%] flex-col border-s border-rule bg-paper transition-transform duration-300 ease-out sm:hidden ${
          open ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="flex min-h-16 items-center justify-between border-b border-rule ps-4 pe-2">
          <span className="font-semibold text-ink">{translation.menu}</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid size-11 place-items-center rounded-input text-ink hover:bg-paper-2"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">{translation.closeMenu}</span>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {groups.map((group) => (
            <div key={group.label} className="pb-4">
              <p className="px-3 pt-2 pb-1 text-sm font-semibold text-muted">
                {group.label}
              </p>
              {group.items.map((item, i) => (
                <NavLink
                  key={i}
                  locale={locale}
                  href={item.href}
                  onLinkClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-rule p-4">
          <ThemeSwitcher translation={translation.theme} labelled />
        </div>
      </div>
    </>
  );
}
