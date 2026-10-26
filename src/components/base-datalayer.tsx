'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Locale } from '@/i18n/routing';
import type { PageType } from '@/types/analytics';
import { setPageContext } from '@/utils/analytics';

interface BaseDatalayerProps {
  locale: Locale;
  pageType: PageType;
  pageSubtype: string;
}

// Every page renders one. It sets the context that every later event carries
// and pushes `page_context`, which GTM sends to GA4 as the page_view (on load
// and on every client navigation).
export default function BaseDatalayer({
  locale,
  pageType,
  pageSubtype,
}: BaseDatalayerProps) {
  const pathName = usePathname();

  useEffect(() => {
    setPageContext({ locale, page_type: pageType, page_subtype: pageSubtype });
  }, [locale, pageType, pageSubtype, pathName]);

  return null;
}
