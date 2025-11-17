import CompressorPage from '@/components/compressor-page';
import {
  getVideoPageMetadataDictionary,
  getVideoPageSeoDictionary,
  getUploadDictionary,
  Locale,
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
  };
}

export default async function App({ params }: Props) {
  const { locale } = await params;
  const seoTranslation = await getVideoPageSeoDictionary(locale);
  const uploadTranslation = await getUploadDictionary(locale);
  return (
    <CompressorPage
      locale={locale}
      compressorType="video"
      seoTranslation={seoTranslation}
      uploadTranslation={uploadTranslation}
    />
  );
}
