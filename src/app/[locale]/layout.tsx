import {
  locales,
  localeIsValid,
  Locale,
  rtlLocales,
  getNavBarDictionary,
  getFooterDictionary,
  getCookieDictionary,
} from '@/i18n/lib';
import { notFound } from 'next/navigation';
import '../globals.css';
import React from 'react';
import CookieConsent from '@/components/cookie-consent';
import { GoogleTagManager } from '@next/third-parties/google';
import NavBar from '@/components/nav-bar';
import Footer from '@/components/footer';

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const cookieTransalations = await getCookieDictionary(locale);
  const navBarTranslations = await getNavBarDictionary(locale);
  const footerTranslations = await getFooterDictionary(locale);

  // Verificar que el locale es válido
  if (!localeIsValid(locale)) {
    notFound();
  }

  return (
    <html lang={locale} dir={rtlLocales.includes(locale) ? 'rtl' : 'ltr'}>
      <body>
        <div className="bg-gray-50 min-h-screen font-sans">
          <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
            <NavBar translations={navBarTranslations} locale={locale} />
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 mt-12">
            <Footer translations={footerTranslations} locale={locale} />
          </footer>
          <CookieConsent translations={cookieTransalations} locale={locale} />
          <GoogleTagManager gtmId="GTM-THHRLH4N" />
          <style>{`.toggle-checkbox:checked { right: 0; border-color: #2563eb; } .toggle-checkbox:checked + .toggle-label { background-color: #2563eb; }`}</style>
        </div>
      </body>
    </html>
  );
}
