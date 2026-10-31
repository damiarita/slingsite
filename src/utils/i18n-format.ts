import { Fragment, createElement, type ReactNode } from 'react';

// Small formatting helpers for dictionary strings. Dictionaries are plain
// JSON passed as props (no next-intl messages), so placeholders are `{name}`
// and plural strings are objects keyed by Intl.PluralRules category, with `#`
// standing for the number.

export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string;
};

// Arabic pages show Latin digits everywhere else (inputs, file sizes), so
// numbers in sentences use them too.
const numberLocale = (locale: string) =>
  locale === 'ar' ? 'ar-u-nu-latn' : locale;

export const formatNumber = (
  locale: string,
  value: number,
  options?: Intl.NumberFormatOptions,
) => new Intl.NumberFormat(numberLocale(locale), options).format(value);

export const formatCount = (
  locale: string,
  count: number,
  forms: PluralForms,
) =>
  (forms[new Intl.PluralRules(locale).select(count)] ?? forms.other).replace(
    '#',
    formatNumber(locale, count),
  );

export const formatList = (locale: string, items: string[]) =>
  new Intl.ListFormat(locale, { type: 'conjunction' }).format(items);

export const fill = (
  template: string,
  values: Record<string, string | number>,
) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );

// Like `fill`, for placeholders that are elements (a link, a <code>).
export const fillNodes = (
  template: string,
  values: Record<string, ReactNode>,
): ReactNode[] =>
  template
    .split(/(\{\w+\})/)
    .map((part, i) =>
      createElement(
        Fragment,
        { key: i },
        /^\{\w+\}$/.test(part) && part.slice(1, -1) in values
          ? values[part.slice(1, -1)]
          : part,
      ),
    );

// Decimal units (1 KB = 1000 B), like the OS file managers that show them.
export function formatBytes(locale: string, bytes: number) {
  const [value, unit] =
    bytes < 1e3
      ? [bytes, 'B']
      : bytes < 1e6
        ? [bytes / 1e3, 'KB']
        : bytes < 1e9
          ? [bytes / 1e6, 'MB']
          : [bytes / 1e9, 'GB'];
  const digits = unit === 'B' || value >= 100 ? 0 : 1;
  return `${formatNumber(locale, value, { maximumFractionDigits: digits })} ${unit}`;
}
