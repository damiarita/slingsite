import CompressorPage from '@/components/compressor-page';
import {
  getVideoPageMetadataDictionary,
  getVideoPageSeoDictionary,
  getUploadDictionary,
  Locale,
  getSettingsDictionary,
  getResultDictionary,
  getDevicesDictionary,
} from '@/i18n/lib';
import { getUrl, getUrlsByLocale } from '@/utils/urls';
import { Metadata } from 'next';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const translations = await getVideoPageMetadataDictionary(locale);
  return {
    title: translations.title,
    description: translations.description,
    alternates: {
      canonical: getUrl(locale, 'video'),
      languages: getUrlsByLocale('video'),
    },
    openGraph: {
      title: translations.title,
      description: translations.description,
      url: getUrl(locale, 'video'),
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
  const devicesTranslation = await getDevicesDictionary(locale);
  return (
    <CompressorPage
      locale={locale}
      compressorType="video"
      seoTranslation={seoTranslation}
      uploadTranslation={uploadTranslation}
      settingTranslation={settingTranslation}
      resultTranslation={resultTranslation}
      devicesTranslation={devicesTranslation}
    />
  );
}
