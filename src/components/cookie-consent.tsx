'use client';

import { useEffect } from 'react';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import { acceptedCategory, run } from 'vanilla-cookieconsent';
import { Locale, localeDirection } from '@/i18n/routing';
import { CookieConsentTranslations } from '@/i18n/type';
import { gtag } from '@/utils/analytics';
import { defaultConsentMode } from '@/utils/tag-manager';

const updateGtagConsent = () => {
  gtag('consent', 'update', {
    ...defaultConsentMode,
    analytics_storage: acceptedCategory('analytics') ? 'granted' : 'denied',
  });
};

export default function CookieConsent({
  locale,
  translations,
}: {
  locale: Locale;
  translations: CookieConsentTranslations;
}) {
  // The consent default is set inline in <head> (Body), before GTM loads.
  useEffect(() => {
    run({
      categories: {
        necessary: {
          enabled: true, // this category is enabled by default
          readOnly: true, // this category cannot be disabled
        },
        preferences: {},
        analytics: {},
      },
      language: {
        default: locale,
        autoDetect: 'browser',
        rtl: localeDirection(locale) === 'rtl' ? [locale] : [],
        translations: {
          [locale]: translations,
        },
      },
      onFirstConsent: updateGtagConsent,
      onConsent: updateGtagConsent,
      onChange: updateGtagConsent,
    });
  }, [translations, locale]);
  return null;
}
