import Script from 'next/script';
import { Locale } from '@/i18n/routing';

export default function BaseDatalayer({
  locale,
  pageType,
  pageSubtype,
}: {
  locale: Locale;
  pageType: string;
  pageSubtype?: string;
}) {
  const objectToPush = JSON.stringify({ locale, pageType, pageSubtype });

  return (
    <Script
      id="base-datalayer"
      dangerouslySetInnerHTML={{
        __html: `window.dataLayer = window.dataLayer || [];window.dataLayer.push(${objectToPush});`,
      }}
    />
  );
}
