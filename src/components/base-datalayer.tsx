'use client';

import { useEffect } from 'react';
import { Locale } from '@/i18n/routing';

interface BaseDatalayerProps {
  locale: Locale;
  pageType: string;
  pageSubtype?: string;
}

export default function BaseDatalayer({
  locale,
  pageType,
  pageSubtype,
}: BaseDatalayerProps) {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
      locale,
      pageType,
      pageSubtype,
      env: process.env.NODE_ENV || 'development',
    });
  }, [locale, pageType, pageSubtype]); // Triggers whenever route OR props change

  return null;
}
