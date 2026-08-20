'use client';

import { hasLocale } from 'next-intl';
import { useEffect } from 'react';
import { routing, Locale } from '@/i18n/routing';
import { getUrl, PageType } from '@/utils/urls';

export const Redirecter = ({
  redirecting,
  pageType,
  locale,
}: {
  redirecting: string;
  pageType: PageType;
  locale?: Locale;
}) => {
  useEffect(() => {
    const redirect = () => {
      const destinationUrl = getUrl(
        locale ? locale : getRedirectLocale(),
        pageType,
      );

      const meta = document.createElement('meta');
      meta.httpEquiv = 'refresh';
      meta.content = `0; url=${destinationUrl}`;

      document.head.appendChild(meta);
    };
    //We make the redirect function available for GTM to call it, and we call it after 1s in case it fails
    window.redirect = redirect;
    setTimeout(() => {
      window.redirect();
    }, 1000);
  }, [locale, pageType]);

  return <div>{redirecting}...</div>;
};

function getRedirectLocale(): Locale {
  const browserLocale = navigator.language.split('-')[0];
  return hasLocale(routing.locales, browserLocale)
    ? (browserLocale as Locale)
    : routing.defaultLocale;
}
