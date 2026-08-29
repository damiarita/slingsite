import BaseDatalayer from '@/components/base-datalayer';
import CompressorPage from '@/components/compressor-page';
import PageContent from '@/components/page-content';
import { Locale, routing } from '@/i18n/routing';
import {
  getVideoPageMetadataDictionary,
  getVideoPageSeoDictionary,
  getUploadDictionary,
  getSettingsDictionary,
  getResultDictionary,
} from '@/i18n/requests';
import { withDefault } from '@/utils/urls';
import { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { getDefaultCompressionConfig } from '@/utils/compressor/all';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const translations = await getVideoPageMetadataDictionary(locale);
  return {
    title: translations.title,
    description: translations.description,
    alternates: {
      canonical: getPathname({ locale, href: { pathname: '/video/' } }),
      languages: withDefault(
        routing.locales.reduce(
          (acc, locale) => {
            acc[locale] = getPathname({ href: '/video/', locale: locale });
            return acc;
          },
          {} as Record<Locale, string>,
        ),
      ),
    },
    openGraph: {
      title: translations.title,
      description: translations.description,
      url: getPathname({ locale, href: { pathname: '/video/' } }),
      siteName: 'SlingSite',
      images: [
        {
          url: '/screenshots/video.jpg',
          width: 910,
          height: 465,
          alt: 'SlingSite Logo',
        },
        {
          url: '/favicon.ico',
          width: 256,
          height: 256,
          alt: 'SlingSite Logo',
        },
      ],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: translations.title,
      description: translations.description,
      images: ['/screenshots/image.jpg', '/favicon.ico'],
    },
  };
}

export default async function App({ params }: Props) {
  const { locale } = await params;
  const seoTranslation = await getVideoPageSeoDictionary(locale);
  const uploadTranslation = await getUploadDictionary(locale);
  const settingTranslation = await getSettingsDictionary(locale);
  const resultTranslation = await getResultDictionary(locale);
  const initialConfig = await getDefaultCompressionConfig(locale);
  return (
    <>
      <CompressorPage
        compressorType="video"
        seoTranslation={seoTranslation}
        uploadTranslation={uploadTranslation}
        settingTranslation={settingTranslation}
        resultTranslation={resultTranslation}
        initialConfig={initialConfig}
      />
      <PageContent locale={locale} slug="video" />
      <BaseDatalayer locale={locale} pageType="tool" pageSubtype="video" />
    </>
  );
}
