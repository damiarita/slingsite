import {
  getCookieDictionary,
  getFooterDictionary,
  getNavBarDictionary,
} from '@/i18n/requests';
import { type Locale } from '@/i18n/routing';
import { NextIntlClientProvider } from 'next-intl';
import CookieConsent from '@/components/cookie-consent';
import NavBar from '@/components/nav-bar';
import Footer from '@/components/footer';
import Body from '@/components/body';
import '@/app/globals.css';

export default async function Layout({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const navBarTranslations = await getNavBarDictionary(locale);
  const footerTranslations = await getFooterDictionary(locale);
  const cookieTransalations = await getCookieDictionary(locale);
  return (
    <NextIntlClientProvider locale={locale} messages={{}}>
      <Body locale={locale}>
        <div className="bg-gray-50 min-h-screen font-sans">
          <NavBar locale={locale} translation={navBarTranslations} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 mt-12">
            <Footer translations={footerTranslations} locale={locale} />
          </footer>
          <CookieConsent translations={cookieTransalations} locale={locale} />
        </div>
      </Body>
    </NextIntlClientProvider>
  );
}
