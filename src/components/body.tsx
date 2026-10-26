import { Locale, localeDirection } from '@/i18n/routing';
import { getTagManagerBootstrap } from '@/utils/tag-manager';

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
    <html lang={locale} dir={localeDirection(locale)}>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: getTagManagerBootstrap() }}
        />
      </head>
      <body className={className}>
        {children}
        <style>{`.toggle-checkbox:checked { right: 0; border-color: #2563eb; } .toggle-checkbox:checked + .toggle-label { background-color: #2563eb; }`}</style>
      </body>
    </html>
  );
}
