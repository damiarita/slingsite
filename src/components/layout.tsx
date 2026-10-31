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

// Pages lay out their own width (`page-container`), so sections can run
// full-bleed.
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
        <div className="flex min-h-screen flex-col">
          <NavBar locale={locale} translation={navBarTranslations} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer
            translations={footerTranslations}
            navTranslations={navBarTranslations}
            locale={locale}
          />
          <CookieConsent translations={cookieTransalations} locale={locale} />
        </div>
      </Body>
    </NextIntlClientProvider>
  );
}
