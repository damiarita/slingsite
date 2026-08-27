import BaseDatalayer from '@/components/base-datalayer';
import Body from '@/components/body';
import { Redirecter } from '@/components/redirecter';
import { routing } from '@/i18n/routing';
import {
  getImagePageMetadataDictionary,
  getRedirectionDictionary,
} from '@/i18n/requests';
import { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const redirectionDictionary = await getRedirectionDictionary(
    routing.defaultLocale,
  );
  const destinationPageTranslation = await getImagePageMetadataDictionary(
    routing.defaultLocale,
  );
  return {
    title: redirectionDictionary.redirecting,
    openGraph: {
      title: destinationPageTranslation.title,
      description: destinationPageTranslation.description,
      url: getPathname({
        locale: routing.defaultLocale,
        href: { pathname: '/image/' },
      }),
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
      locale: routing.defaultLocale,
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
  const dict = await getRedirectionDictionary(routing.defaultLocale);
  return (
    <Body locale={routing.defaultLocale}>
      <Redirecter
        href={{ pathname: '/image/' }}
        redirecting={dict.redirecting}
      />
      <BaseDatalayer
        locale={routing.defaultLocale}
        pageType="redirect"
        pageSubtype="root"
      />
    </Body>
  );
}
