import { Locale, rtlLocales } from '@/i18n/routing';
import { GoogleTagManager } from '@next/third-parties/google';

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
    <html lang={locale} dir={rtlLocales.includes(locale) ? 'rtl' : 'ltr'}>
      <body className={className}>
        {children}
        <GoogleTagManager gtmId="GTM-THHRLH4N" />
        <style>{`.toggle-checkbox:checked { right: 0; border-color: #2563eb; } .toggle-checkbox:checked + .toggle-label { background-color: #2563eb; }`}</style>
      </body>
    </html>
  );
}
