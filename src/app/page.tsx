import BaseDatalayer from '@/components/base-datalayer';
import Body from '@/components/body';
import { Redirecter } from '@/components/redirecter';
import { defaultLocale } from '@/i18n/routing';
import {
  getImagePageMetadataDictionary,
  getRedirectionDictionary,
} from '@/i18n/requests';
import { getUrl } from '@/utils/urls';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const redirectionDictionary = await getRedirectionDictionary(defaultLocale);
  const destinationPageTranslation =
    await getImagePageMetadataDictionary(defaultLocale);
  return {
    title: redirectionDictionary.redirecting,
    openGraph: {
      title: destinationPageTranslation.title,
      description: destinationPageTranslation.description,
      url: getUrl(defaultLocale, 'image'),
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
      locale: defaultLocale,
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

export default async function HomePage() {
  const dict = await getRedirectionDictionary(defaultLocale);
  return (
    <Body locale={defaultLocale}>
      <Redirecter pageType="image" redirecting={dict.redirecting} />
      <BaseDatalayer
        locale={defaultLocale}
        pageType="redirect"
        pageSubtype="root"
      />
    </Body>
  );
}
