'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { NavBarTranslations } from '@/i18n/type';
import {
  type ThemeChoice,
  applyThemeChoice,
  readThemeChoice,
  themeChoices,
} from '@/utils/theme';

const icons = { system: Monitor, light: Sun, dark: Moon };

// System / light / dark, as a radio group of three buttons. `labelled` shows
// the words next to the icons (mobile drawer).
export default function ThemeSwitcher({
  translation,
  labelled,
}: {
  translation: NavBarTranslations['theme'];
  labelled?: boolean;
}) {
  // The server can't know the stored choice; the effect reads what the head
  // script applied.
  const [choice, setChoice] = useState<ThemeChoice>('system');
  useEffect(() => setChoice(readThemeChoice()), []);

  const select = (next: ThemeChoice) => {
    applyThemeChoice(next);
    setChoice(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label={translation.label}
      className={`${labelled ? 'flex w-full' : 'inline-flex'} rounded-input border border-rule bg-paper p-0.5`}
      onKeyDown={(e) => {
        // Left and right swap in right-to-left pages.
        const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
        const step = {
          ArrowRight: rtl ? -1 : 1,
          ArrowLeft: rtl ? 1 : -1,
          ArrowDown: 1,
          ArrowUp: -1,
        }[e.key];
        if (!step) return;
        e.preventDefault();
        const next =
          themeChoices[
            (themeChoices.indexOf(choice) + step + themeChoices.length) %
              themeChoices.length
          ];
        select(next);
        e.currentTarget
          .querySelector<HTMLButtonElement>(`[data-choice="${next}"]`)
          ?.focus();
      }}
    >
      {themeChoices.map((option) => {
        const Icon = icons[option];
        const selected = option === choice;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            title={labelled ? undefined : translation[option]}
            tabIndex={selected ? 0 : -1}
            data-choice={option}
            onClick={() => select(option)}
            className={`inline-flex min-h-9 min-w-9 items-center justify-center gap-2 rounded-[4px] text-sm transition-colors duration-150 ${labelled ? 'flex-1 px-3' : ''} ${
              selected
                ? 'bg-ink text-paper'
                : 'text-ink-2 hover:bg-paper-2 hover:text-ink'
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className={labelled ? undefined : 'sr-only'}>
              {translation[option]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
