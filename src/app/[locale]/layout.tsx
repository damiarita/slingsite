import { routing, Locale } from '@/i18n/routing';
import {
  getNavBarDictionary,
  getFooterDictionary,
  getCookieDictionary,
} from '@/i18n/requests';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import '../globals.css';
import CookieConsent from '@/components/cookie-consent';
import NavBar from '@/components/nav-bar';
import Footer from '@/components/footer';
import { NavBarItem } from '@/types/nav-bar';
import Body from '@/components/body';
import { NextIntlClientProvider } from 'next-intl';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
  }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Verificar que el locale es válido
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const validatedLocale = locale as Locale;
  const cookieTransalations = await getCookieDictionary(validatedLocale);
  const navBarTranslations = await getNavBarDictionary(validatedLocale);
  const footerTranslations = await getFooterDictionary(validatedLocale);

  const navBarItems: NavBarItem[] = [
    { href: '/image/', label: navBarTranslations.imageCompressor },
    { href: '/video/', label: navBarTranslations.videoCompressor },
  ];

  return (
    <NextIntlClientProvider locale={validatedLocale} messages={{}}>
      <Body locale={validatedLocale}>
        <div className="bg-gray-50 min-h-screen font-sans">
          <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
            <NavBar locale={validatedLocale} items={navBarItems} />
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 mt-12">
            <Footer
              translations={footerTranslations}
              locale={validatedLocale}
            />
          </footer>
          <CookieConsent
            translations={cookieTransalations}
            locale={validatedLocale}
          />
        </div>
      </Body>
    </NextIntlClientProvider>
  );
}
