import CompressorPage from '@/components/compressor-page';
import {
  getDevicesDictionary,
  getImagePageMetadataDictionary,
  getImagePageSeoDictionary,
  getResultDictionary,
  getSettingsDictionary,
  getUploadDictionary,
  Locale,
} from '@/i18n/lib';
import { getUrl, getUrlsByLocale } from '@/utils/urls';
import { Metadata } from 'next';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const translation = await getImagePageMetadataDictionary(locale);
  return {
    title: translation.title,
    description: translation.description,
    alternates: {
      canonical: getUrl(locale, 'image'),
      languages: getUrlsByLocale('image'),
    },
  };
}

export default async function App({ params }: Props) {
  const { locale } = await params;
  const seoTranslation = await getImagePageSeoDictionary(locale);
  const uploadTranslation = await getUploadDictionary(locale);
  const settingTranslation = await getSettingsDictionary(locale);
  const resultTranslation = await getResultDictionary(locale);
  const devicesTranslation = await getDevicesDictionary(locale);
  return (
    <CompressorPage
      locale={locale}
      compressorType="image"
      seoTranslation={seoTranslation}
      uploadTranslation={uploadTranslation}
      settingTranslation={settingTranslation}
      resultTranslation={resultTranslation}
      devicesTranslation={devicesTranslation}
    />
  );
}
