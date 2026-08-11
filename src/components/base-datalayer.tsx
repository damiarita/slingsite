import { Locale } from '@/i18n/lib';

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
    <script
      dangerouslySetInnerHTML={{
        __html: `window.dataLayer = window.dataLayer || [];window.dataLayer.push(${objectToPush});`,
      }}
    ></script>
  );
}
