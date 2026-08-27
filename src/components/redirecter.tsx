'use client';

import { hasLocale } from 'next-intl';
import { useEffect } from 'react';
import { routing, Locale } from '@/i18n/routing';
import { redirect } from '@/i18n/navigation';

export const Redirecter = ({
  redirecting,
  href,
  locale,
}: {
  redirecting: string;
  href: Parameters<typeof redirect>[0]['href'];
  locale?: Locale;
}) => {
  useEffect(() => {
    const redirectToPage = () => {
      const loc = locale || getRedirectLocale();
      redirect({
        href: href,
        locale: loc,
      });
    };
    //We make the redirect function available for GTM to call it, and we call it after 1s in case it fails
    window.redirect = redirectToPage;
    setTimeout(() => {
      window.redirect();
    }, 1000);
  }, [locale, href]);

  return <div>{redirecting}...</div>;
};

function getRedirectLocale(): Locale {
  const browserLocale = navigator.language.split('-')[0];
  return hasLocale(routing.locales, browserLocale)
    ? (browserLocale as Locale)
    : routing.defaultLocale;
}
