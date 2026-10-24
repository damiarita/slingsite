import type { CompressionPageSeoTranslations } from '@/i18n/type';
import Script from 'next/script';

// Server shell shared by every compressor page: heading, copy and JSON-LD.
// The interactive part (a client wrapper around CompressorApp) comes in as
// children, because the settings component and job creation are functions
// and can't be passed from a server component.
export default function CompressorPage({
  seoTranslation,
  children,
}: {
  seoTranslation: CompressionPageSeoTranslations;
  children: React.ReactNode;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    applicationCategory: 'BrowserApplication',
    name: 'SlingSite',
    offers: { '@type': 'Offer', price: 0 },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.9,
      reviewCount: 100,
      bestRating: 5,
    },
    isAccessibleForFree: true,
  };

  return (
    <>
      <Script type="application/ld+json">{JSON.stringify(schema)}</Script>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {seoTranslation.title}
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            {seoTranslation.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 items-start">{children}</div>
      </div>
    </>
  );
}
