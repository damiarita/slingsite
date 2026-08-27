import BaseDatalayer from '@/components/base-datalayer';
import CompressorPage from '@/components/compressor-page';
import PageContent from '@/components/page-content';
import { Locale, routing } from '@/i18n/routing';
import {
  getDevicesDictionary,
  getImagePageMetadataDictionary,
  getImagePageSeoDictionary,
  getResultDictionary,
  getSettingsDictionary,
  getUploadDictionary,
} from '@/i18n/requests';
import { withDefault } from '@/utils/urls';
import { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const translation = await getImagePageMetadataDictionary(locale);
  return {
    title: translation.title,
    description: translation.description,
    alternates: {
      canonical: getPathname({ locale, href: { pathname: '/image/' } }),
      languages: withDefault(
        routing.locales.reduce(
          (acc, locale) => {
            acc[locale] = getPathname({ href: '/image/', locale: locale });
            return acc;
          },
          {} as Record<Locale, string>,
        ),
      ),
    },
    openGraph: {
      title: translation.title,
      description: translation.description,
      url: getPathname({ locale, href: { pathname: '/image/' } }),
      siteName: 'SlingSite',
      images: [
        {
          url: '/screenshots/image.jpg',
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
      title: translation.title,
      description: translation.description,
      images: ['/screenshots/image.jpg', '/favicon.ico'],
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
    <>
      <CompressorPage
        locale={locale}
        compressorType="image"
        seoTranslation={seoTranslation}
        uploadTranslation={uploadTranslation}
        settingTranslation={settingTranslation}
        resultTranslation={resultTranslation}
        devicesTranslation={devicesTranslation}
      />
      <PageContent locale={locale} slug="image" />
      <BaseDatalayer locale={locale} pageType="tool" pageSubtype="image" />
    </>
  );
}
