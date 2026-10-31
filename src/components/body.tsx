import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Arabic,
} from 'next/font/google';
import { Locale, localeDirection } from '@/i18n/routing';
import { getTagManagerBootstrap } from '@/utils/tag-manager';
import { getThemeBootstrap } from '@/utils/theme';

const plexSans = IBM_Plex_Sans({
  weight: ['400', '600'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-plex-sans',
  display: 'swap',
});
// Only for the Arabic glyphs. Its @font-face has an Arabic unicode-range, so
// other locales never download it; no preload for the same reason.
const plexArabic = IBM_Plex_Sans_Arabic({
  weight: ['400', '600'],
  subsets: ['arabic'],
  variable: '--font-plex-arabic',
  display: 'swap',
  preload: false,
});
const plexMono = IBM_Plex_Mono({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-plex-mono',
  display: 'swap',
  preload: false,
});

export default function Body({
  locale,
  children,
  className,
}: {
  locale: Locale;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    // The theme script sets data-theme before React hydrates.
    <html
      lang={locale}
      dir={localeDirection(locale)}
      className={`${plexSans.variable} ${plexArabic.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeBootstrap() }} />
        <script
          dangerouslySetInnerHTML={{ __html: getTagManagerBootstrap() }}
        />
      </head>
      <body className={className}>{children}</body>
    </html>
  );
}
