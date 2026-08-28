import BaseDatalayer from '@/components/base-datalayer';
import Body from '@/components/body';
import { Redirecter } from '@/components/redirecter';
import { Locale, routing } from '@/i18n/routing';
import {
  getImagePageMetadataDictionary,
  getRedirectionDictionary,
} from '@/i18n/requests';
import { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
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
      url: getPathname({ locale: locale, href: { pathname: '/image/' } }),
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
      locale: locale,
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
    <>
      <Redirecter
        href={{ pathname: '/image/' }}
        locale={locale}
        redirecting={dict.redirecting}
      />
      <BaseDatalayer locale={locale} pageType="redirect" pageSubtype="root" />
    </>
  );
}
