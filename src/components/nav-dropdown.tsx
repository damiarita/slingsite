'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import NavLink, { hrefPathname, type AppHref } from './nav-link';
import type { Locale } from '@/i18n/routing';
import { usePathname } from '@/i18n/navigation';

export type NavGroup = {
  label: string;
  items: { href: AppHref; label: string }[];
};

// Desktop nav entry that groups several pages. Opens on hover and on click
// (for touch and keyboard).
export default function NavDropdown({
  group,
  locale,
}: {
  group: NavGroup;
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  // With a mouse, hover opens the menu just before the click lands; that
  // click must not toggle it closed again.
  const openedByHover = useRef(false);
  const currentPath = usePathname();
  const isActive = group.items.some(
    (item) => hrefPathname(item.href) === currentPath,
  );
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (e.target instanceof Node && !ref.current?.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={() => {
        if (!open) openedByHover.current = true;
        setOpen(true);
      }}
      onMouseLeave={() => {
        openedByHover.current = false;
        setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          if (openedByHover.current) {
            openedByHover.current = false;
            return;
          }
          setOpen((v) => !v);
        }}
        className={`inline-flex items-center px-2 py-1 text-sm transition-colors ${
          isActive
            ? 'text-blue-800 font-semibold'
            : 'text-gray-700 hover:text-blue-800'
        }`}
      >
        {group.label}
        <ChevronDown
          className={`w-4 h-4 ms-1 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Always rendered — even while "closed" — so the links are present in
         the static HTML for crawlers. Open/closed is expressed with CSS plus
         aria-hidden/inert, never by adding/removing the links from the DOM.
         The padding (not margin) keeps the hover area continuous. */}
      <div
        id={menuId}
        className={`absolute end-0 top-full pt-2 z-50 origin-top transition-all duration-150 ${
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <div
          className="w-56 py-1 bg-white rounded-md shadow-md border border-gray-200"
          role="menu"
        >
          {group.items.map((item, i) => (
            <NavLink
              key={i}
              locale={locale}
              href={item.href}
              onLinkClick={() => setOpen(false)}
              mobile
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
