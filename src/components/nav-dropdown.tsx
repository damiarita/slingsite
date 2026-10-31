'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import NavLink, { hrefPathname } from './nav-link';
import type { NavGroup } from './nav-groups';
import type { Locale } from '@/i18n/routing';
import { usePathname } from '@/i18n/navigation';

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
        className={`inline-flex min-h-11 items-center gap-1 rounded-input px-3 text-sm transition-colors duration-150 ${
          isActive
            ? 'text-ink underline decoration-accent decoration-2 underline-offset-[0.6em]'
            : 'text-ink-2 hover:text-ink'
        }`}
      >
        {group.label}
        <ChevronDown
          className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Always rendered — even while "closed" — so the links are present in
         the static HTML for crawlers. Open/closed is expressed with CSS plus
         aria-hidden/inert, never by adding/removing the links from the DOM.
         The padding (not margin) keeps the hover area continuous. */}
      <div
        id={menuId}
        className={`absolute end-0 top-full z-50 origin-top pt-2 transition-[opacity,transform] duration-150 ${
          open
            ? 'pointer-events-auto scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0'
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <div
          className="w-60 rounded-card border border-rule bg-paper p-1 shadow-[0_16px_40px_-16px_var(--color-scrim)]"
          role="menu"
        >
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
      </div>
    </div>
  );
}
