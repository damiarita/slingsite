import {
  getImagePageMetadataDictionary,
  getRedirectionDictionary,
  Locale,
} from '@/i18n/lib';
import { Redirecter } from '@/components/redirecter';
import { Metadata } from 'next';
import { getUrl } from '@/utils/urls';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const redirectionDictionary = await getRedirectionDictionary(locale);
  const destinationPageTranslation =
    await getImagePageMetadataDictionary(locale);
  return {
    title: redirectionDictionary.redirecting,
    openGraph: {
      title: destinationPageTranslation.title,
      description: destinationPageTranslation.description,
      url: getUrl(locale, 'image'),
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
      title: destinationPageTranslation.title,
      description: destinationPageTranslation.description,
      images: ['/screenshots/image.jpg', '/favicon.ico'],
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const dict = await getRedirectionDictionary(locale);

  return (
    <Redirecter
      locale={locale}
      pageType="image"
      redirecting={dict.redirecting}
    />
  );
}
