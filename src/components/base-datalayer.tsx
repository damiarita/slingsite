'use client';

import { useEffect } from 'react';
import { Locale } from '@/i18n/routing';
import { usePathname } from 'next/navigation';

interface BaseDatalayerProps {
  locale: Locale;
  pageType: string;
  pageSubtype: string;
}

export default function BaseDatalayer({
  locale,
  pageType,
  pageSubtype,
}: BaseDatalayerProps) {
  const pathName = usePathname();

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
      locale,
      event: 'page_view',
      pageType,
      pageSubtype,
      env: process.env.NODE_ENV || 'development',
    });
  }, [locale, pageType, pageSubtype, pathName]); // Triggers whenever route OR props change

  return null;
}
