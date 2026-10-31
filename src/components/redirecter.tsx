'use client';

import { hasLocale } from 'next-intl';
import { useEffect } from 'react';
import { routing, Locale } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import { withTrailingSlash } from '@/utils/seo';

export const Redirecter = ({
  redirecting,
  href,
  locale,
}: {
  redirecting: string;
  href: Parameters<typeof getPathname>[0]['href'];
  locale?: Locale;
}) => {
  useEffect(() => {
    const redirectToPage = () => {
      const pathname = getPathname({
        href: href,
        locale: locale || getRedirectLocale(),
      });
      // A full load, not next-intl's redirect: outside of a render, that one
      // keeps this page's tree in the router, so its effect runs again on the
      // next client navigation and sends the visitor back here.
      window.location.replace(withTrailingSlash(pathname));
    };
    //We make the redirect function available for GTM to call it, and we call it after 1s in case it fails
    //The delay gives GTM time to send this page's page_view, so the session starts with the original referrer
    window.redirect = redirectToPage;
    const timeout = setTimeout(redirectToPage, 1000);
    return () => {
      clearTimeout(timeout);
      delete window.redirect;
    };
  }, [locale, href]);

  return <div>{redirecting}...</div>;
};

function getRedirectLocale(): Locale {
  const browserLocale = navigator.language.split('-')[0];
  return hasLocale(routing.locales, browserLocale)
    ? (browserLocale as Locale)
    : routing.defaultLocale;
}
