import type { CompressionInput } from '@/types/compressor';
import type {
  CompressionPageSeoTranslations,
  ResultsDictionary,
  SettingsDictionary,
  UploadDictionary,
} from '@/i18n/type';
import Script from 'next/script';
import { SizingConfigs } from '@/types/config';
import CompressorApp from './compressor-app';

export default function App({
  compressorType,
  initialConfig,
  seoTranslation,
  uploadTranslation,
  settingTranslation,
  resultTranslation,
}: {
  compressorType: CompressionInput;
  initialConfig: SizingConfigs;
  seoTranslation: CompressionPageSeoTranslations;
  uploadTranslation: UploadDictionary;
  settingTranslation: SettingsDictionary;
  resultTranslation: ResultsDictionary;
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
        <div className="grid grid-cols-1 gap-8 items-start">
          <CompressorApp
            compressorType={compressorType}
            initialConfig={initialConfig}
            uploadTranslation={uploadTranslation}
            settingTranslation={settingTranslation}
            resultTranslation={resultTranslation}
          />
        </div>
      </div>
    </>
  );
}
